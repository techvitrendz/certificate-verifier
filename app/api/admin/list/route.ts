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

export async function GET(req: Request) {
	try {
		if (!admin.apps.length)
			return NextResponse.json(
				{ error: "Server not configured" },
				{ status: 500 }
			);
		await verifyTokenAndAdmin(req);

		const snapshot = await admin.firestore().collection("certificates").get();
		const items: Record<string, unknown>[] = [];
		snapshot.forEach((d) =>
			items.push({ id: d.id, ...(d.data() as Record<string, unknown>) })
		);

		return NextResponse.json({ ok: true, items });
	} catch (err: any) {
		if (String(err) === "Error: no-token")
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		if (String(err) === "Error: not-authorized")
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		return NextResponse.json(
			{ error: String(err?.message || err) },
			{ status: 500 }
		);
	}
}
