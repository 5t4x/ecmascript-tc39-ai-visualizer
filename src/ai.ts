/* eslint-disable no-constant-condition */
import { fetchProposals } from "@/proposals";
import type { Proposal } from "@/proposals";
import { Octokit } from "@octokit/rest";
import type { Statement } from "better-sqlite3";
import Database from "better-sqlite3";
import { decode, encode } from "gpt-tokenizer";
import type { Schema } from "jsonschema";
import { Validator } from "jsonschema";
import { Configuration, OpenAIApi } from "openai";

export interface Section {
  title: string;
  /**
   * Markdown code (title not included)
   */
  body: string;
}

export interface Page {
  header: {
    title: string;
    description: string;
  };
  sections: Section[];
}

const sectionSchema: Schema = {
  id: "section",
  type: "object",
  required: ["title", "body"],
  properties: {
    title: { type: "string", description: "Title of the section" },
    body: {
      type: "string",
      description: "Markdown description of the section.",
    },
  },
};

const pageSchema: Schema = {
  id: "page",
  type: "object",
  required: ["header", "sections"],
  properties: {
    header: {
      type: "object",
      required: ["title", "description"],
      properties: {
        title: { type: "string", description: "Title of the page" },
        description: { type: "string", description: "Description of the page" },
      },
    },
    sections: {
      type: "array",
      items: { $ref: "section" },
    },
  },
};

const validator = new Validator();

validator.addSchema(pageSchema);
validator.addSchema(sectionSchema);

const octokit = new Octokit();

const db = new Database("proposal.db", { fileMustExist: true });

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const getProposal = db.prepare(
  "SELECT PROPOSAL, PAGE FROM GPT WHERE ID = :id;"
) as Omit<Statement<{ id: string }>, "get"> & {
  get(params: { id: string }): { PROPOSAL: string; PAGE: string } | undefined;
};

export const setProposal = db.prepare<{
  id: string;
  proposal: string;
  page: string;
}>(
  "INSERT OR REPLACE INTO GPT (ID, PROPOSAL, PAGE) VALUES (:id, :proposal, :page);"
);

async function getREADME(proposal: Proposal) {
  const [, owner, repo] =
    proposal.url.match(/^https:\/\/github\.com\/(.*?)\/(.*?)$/) || [];

  if (!owner || !repo) {
    const msg = `${proposal.id} is not hosted on GitHub.`;
    console.warn(msg);
    // pass it off to the AI
    // maybe it can explain to the user why it can't load any data
    return msg;
  }

  const data = await octokit.repos.get({ owner, repo });

  // hopefully README.md stays the same
  const readme = await fetch(
    `https://raw.githubusercontent.com/${owner}/${repo}/${data.data.default_branch}/README.md`
  );

  if (!readme.ok) {
    const msg = `Failure fetching readme for ${proposal.id}.`;
    console.warn(msg);
    return msg;
  }

  return await readme.text();
}

const ongoing = new Map<string, Promise<unknown>>();

// prevent race condition when writing to DB/fetching openai API (prevent 429s)
export function getReadyProposalData(proposalID: string) {
  const data = getProposal.get({ id: proposalID });

  if (data)
    return {
      page: JSON.parse(data.PAGE) as Page,
      proposal: JSON.parse(data.PROPOSAL) as Proposal,
    };

  const got = ongoing.get(proposalID);

  // already doing the logic following this if() statement
  if (typeof got !== "undefined") return;

  const promise = getHTML(proposalID);

  ongoing.set(proposalID, promise);

  promise.finally(() => {
    ongoing.delete(proposalID);
  });
}

async function getHTML(proposalID: string) {
  const proposals = await fetchProposals();
  const proposal = proposals.find((p) => p.id === proposalID);

  if (!proposal) return;

  const readme = await getREADME(proposal);

  const assistantPrefix = `{\n  "header": {\n    "title": `;

  while (true) {
    const verbalAssistantPrefix =
      `Write a JSON response to explain this proposal. You will respond with a JSON object compatible with Page.\n` +
      `Be concise but informative. Do the following sections: Status of proposal, Summary (background, motivation, and proposal), and examples (provide at least 2 realistic code examples).\n` +
      `When writing sections, remember that the section body can support markdown.\n` +
      `Please write the code to continue this JSON and fulfill the prompt: ${assistantPrefix}`;

    console.log("making API request");

    const gpt = await openai.createChatCompletion({
      messages: [
        {
          content: decode(
            encode(
              `The current date is ${new Date()}.\n` +
                `${JSON.stringify(validator.schemas)}\n` +
                `Metadata: ${JSON.stringify(proposal)}\n` +
                `README: ${readme}\n`
            ).slice(0, 2048 - encode(verbalAssistantPrefix).length)
          ),
          role: "system",
        },
        {
          content: verbalAssistantPrefix,
          role: "user",
        },
      ],
      model: "gpt-3.5-turbo",
    });

    const choice = gpt.data.choices[0];

    console.log("finish reason:", choice.finish_reason);
    // TODO: add output to assistantPrefix and keep going if (choice.finish_reason === token limit)

    const out = assistantPrefix + (choice.message?.content || "");

    try {
      const json = JSON.parse(out);
      validator.validate(json, { $ref: "page" }, { throwError: true });
      setProposal.run({
        id: proposalID,
        page: out,
        proposal: JSON.stringify(proposal),
      });
      return {
        data: json as Page,
        proposal,
      };
    } catch (err) {
      console.warn(err);
      console.log(out);
      continue;
    }
  }
}
