import { getReadyProposalData } from "@/ai";

export function GET(
  request: Request,
  {
    params: { proposal },
  }: {
    params: { proposal: string };
  }
) {
  const got = getReadyProposalData(proposal);
  return new Response(undefined, { status: got ? 204 : 425 });
}
