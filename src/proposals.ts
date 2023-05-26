export interface Proposal {
  tags: string[];
  stage: number;
  name: string;
  id?: string;
  description: string;
  url: string;
  notes: { date: string; url: string }[];
  rationale: string;
  authors: string[];
  "has-specification": boolean;
  champions: string[];
  pushed_at: string;
}

type Proposals = Proposal[];

export async function fetchProposals() {
  const res = await fetch("https://tc39.es/dataset/proposals.min.json");

  if (!res.ok)
    throw new TypeError("NetworkError: Error fetching proposals.min.json");

  return (await res.json()) as Proposals;
}
