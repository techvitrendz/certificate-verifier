import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import { randomUUID } from "crypto";

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
		await verifyTokenAndAdmin(req);

		const body = await req.json();
		const { name, reason, dateIssued } = body || {};
		if (!name)
			return NextResponse.json({ error: "name required" }, { status: 400 });

		// generate a secure random id for the certificate
		const id = randomUUID();

		await admin
			.firestore()
			.collection("certificates")
			.doc(id)
			.set({
				name,
				reason: reason || "",
				dateIssued: dateIssued || new Date().toISOString(),
				valid: true,
			});

		// write audit entry
		try {
			const decoded = await verifyTokenAndAdmin(req);
			const actor = decoded as { uid?: string; email?: string };
			await admin
				.firestore()
				.collection("audits")
				.add({
					action: "add",
					targetId: id,
					actorUid: actor.uid || null,
					actorEmail: actor.email || null,
					timestamp: new Date().toISOString(),
					details: { name, reason, dateIssued },
				});
		} catch (auditErr) {
			// don't fail the main request if audit logging fails; just log server-side
			console.error("audit add failed", auditErr);
		}

		return NextResponse.json({ ok: true, id });
	} catch (err) {
		const message = String((err as Error)?.message || err);
		if (message === "Error: no-token")
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		if (message === "Error: not-authorized")
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
