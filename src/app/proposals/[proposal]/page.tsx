import Loader from "./components/Loader";
import MarkdownHighlight from "@/MarkdownHighlight";
import { getReadyProposalData } from "@/ai";
import type { Proposal } from "@/proposals";
import Link from "next/link";
import { Fragment } from "react";
import ReactMarkdown from "react-markdown";

export default async function Proposal({
  params: { proposal },
}: {
  params: { proposal: string };
}) {
  const data = getReadyProposalData(proposal);

  return (
    <div className="container mt-4">
      <Link href="/">Go Back</Link>
      {data ? (
        <>
          <h1 className="mt-4">{data.page.header.title}</h1>
          <p>{data.page.header.description}</p>
          {data.page.sections.map((section, i) => (
            <Fragment key={i}>
              <h3>{section.title}</h3>
              <ReactMarkdown
                components={{
                  code({ inline, className, children, ...props }) {
                    const [, language] =
                      className?.match(/language-(\w+)/) || [];

                    return !inline && language ? (
                      <MarkdownHighlight language={language}>
                        {String(children).replace(/\n$/, "")}
                      </MarkdownHighlight>
                    ) : (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {section.body}
              </ReactMarkdown>
            </Fragment>
          ))}
        </>
      ) : (
        <Loader proposal={proposal} />
      )}
    </div>
  );
}
