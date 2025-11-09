import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

async function verifyTokenAndAdmin(req: Request) {
	const auth = req.headers.get("authorization") || "";
	const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;
	if (!token) throw new Error("no-token");
	const decoded = await admin.auth().verifyIdToken(token);

	const allowedRaw = process.env.ADMIN_EMAILS || "";
	const allowed = allowedRaw
		.split(",")
		.map((s) => s.trim().toLowerCase())
		.filter(Boolean);
	const email = (decoded.email || "").toLowerCase();
	if (allowed.length > 0 && !allowed.includes(email))
		throw new Error("not-authorized");

	return decoded;
}

export async function POST(req: Request) {
	try {
		if (!admin.apps.length)
			return NextResponse.json(
				{ error: "Server not configured" },
				{ status: 500 }
			);
		const decoded = await verifyTokenAndAdmin(req);

		const body = await req.json();
		const { id } = body || {};
		if (!id)
			return NextResponse.json({ error: "id required" }, { status: 400 });

		await admin
			.firestore()
			.collection("certificates")
			.doc(id)
			.update({ valid: false });

		// audit invalidate
		try {
			const actor = decoded as { uid?: string; email?: string };
			await admin
				.firestore()
				.collection("audits")
				.add({
					action: "invalidate",
					targetId: id,
					actorUid: actor.uid || null,
					actorEmail: actor.email || null,
					timestamp: new Date().toISOString(),
					details: { valid: false },
				});
		} catch (auditErr) {
			console.error("audit invalidate failed", auditErr);
		}

		return NextResponse.json({ ok: true });
	} catch (err) {
		const message = String((err as Error)?.message || err);
		if (message === "Error: no-token")
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		if (message === "Error: not-authorized")
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
