import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  return auth.handler(request);
}

export async function POST(request: Request) {
  const isSignUp = new URL(request.url).pathname.endsWith("/sign-up/email");
  if (!isSignUp) return auth.handler(request);

  const body = (await request.json()) as Record<string, unknown>;
  const inviteCode = typeof body.inviteCode === "string" ? body.inviteCode : "";
  if (!process.env.BIRTHDAY_INVITE_CODE || inviteCode !== process.env.BIRTHDAY_INVITE_CODE) {
    return Response.json({ message: "A valid invitation code is required to create an account." }, { status: 403 });
  }

  delete body.inviteCode;
  const headers = new Headers(request.headers);
  headers.delete("content-length");
  return auth.handler(new Request(request.url, { method: "POST", headers, body: JSON.stringify(body) }));
}
