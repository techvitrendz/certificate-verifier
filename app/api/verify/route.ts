import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
	try {
		const body = await req.json();
		const id = body?.id;
		if (!id)
			return NextResponse.json({ error: "id required" }, { status: 400 });

		if (!admin.apps.length) {
			return NextResponse.json(
				{ error: "Server not configured" },
				{ status: 500 }
			);
		}

		const doc = await admin
			.firestore()
			.collection("certificates")
			.doc(id)
			.get();
		if (!doc.exists) return NextResponse.json({ found: false });

		const data = doc.data() as Record<string, any> | undefined;
		// If the certificate was explicitly invalidated (valid === false), treat as not found
		if (data && data.valid === false)
			return NextResponse.json({ found: false });

		return NextResponse.json({ found: true, data });
	} catch (err: any) {
		return NextResponse.json(
			{ error: String(err?.message || err) },
			{ status: 500 }
		);
	}
}
