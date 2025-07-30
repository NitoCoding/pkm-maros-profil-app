// /app/api/login/route.ts (Next.js App Router)
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const { token } = await req.json(); // from client

	(await cookies()).set("token", token, {
		httpOnly: true,
		secure: true,
		sameSite: "strict",
		maxAge: 60 * 60 * 24, // 1 day
		path: "/",
	});

	return NextResponse.json({ success: true });
}
