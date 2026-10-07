// The build that is live, for tabs left open to compare with their own.
export const dynamic = "force-static";

export function GET() {
  return Response.json({ build: process.env.SITE_BUILD });
}
