import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

export async function GET() {
	try {
		const initialized = !!admin.apps.length;
		// avoid returning any sensitive info
		return NextResponse.json({ initialized, apps: admin.apps.length });
	} catch (err) {
		return NextResponse.json(
			{ initialized: false, error: String(err) },
			{ status: 500 }
		);
	}
}
