import { NextResponse } from "next/server";
import { api, ApiError } from "@/lib/api/client";
import { authHeaders, getToken } from "@/lib/auth/session";

type TicketResponse = { ticket: string; expiresAt: string; url: string };

export async function POST() {
  if (!(await getToken())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await api.post<TicketResponse>("/realtime/ticket", {
      headers: await authHeaders(),
    });
    return NextResponse.json({ url });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    return NextResponse.json({ error: "ticket_failed" }, { status });
  }
}
