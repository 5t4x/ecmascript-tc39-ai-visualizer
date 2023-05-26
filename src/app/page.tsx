import { fetchProposals } from "../proposals";
import Link from "next/link";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";

export default async function Index() {
  const proposals = await fetchProposals();

  return (
    <div className="container mt-5">
      <h1>ECMAScript TC39 AI Visualizer</h1>
      <p>
        Click on any of the proposals below for an AI generated summary and
        example 🤖
      </p>
      <div className="card">
        <div className="list-group">
          {proposals
            .filter((p) => p.id)
            .map((p, i) => (
              <Link
                href={`/proposals/${p.id}`}
                key={i}
                className="list-group-item list-group-item-action flex-column align-items-start"
              >
                <div className="d-flex w-100 justify-content-between">
                  <h5 className="mb-1">{p.name}</h5>
                  {p.pushed_at && (
                    <small>{new Date(p.pushed_at).toDateString()}</small>
                  )}
                </div>
                <p className="mb-1">
                  <ReactMarkdown>{p.description}</ReactMarkdown>
                </p>
                <small>Stage {p.stage}</small>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
