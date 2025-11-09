import admin from "firebase-admin";
import type { ServiceAccount } from "firebase-admin";

function initAdmin() {
	// Avoid re-initialization in serverless environment
	try {
		if (!admin.apps.length) {
			const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
			if (!serviceAccountJson) {
				// Try to build service account from individual env vars (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, FIREBASE_PROJECT_ID)
				const pk = process.env.FIREBASE_PRIVATE_KEY;
				const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
				const projectId = process.env.FIREBASE_PROJECT_ID;
				if (pk && clientEmail && projectId) {
					// Normalize private key: convert literal "\\n" sequences to real newlines.
					// This handles env files where the key was stored with escaped newlines.
					const fixedKey = pk.replace(/\\n/g, "\n");
					const serviceAccountFromParts = {
						private_key: fixedKey,
						client_email: clientEmail,
						project_id: projectId,
					};
					admin.initializeApp({
						credential: admin.credential.cert(
							serviceAccountFromParts as ServiceAccount
						),
					});
					return;
				}
				console.warn(
					"FIREBASE_SERVICE_ACCOUNT_JSON not set - admin SDK not initialized"
				);
				return;
			}

			let serviceAccount: Record<string, unknown> | null = null;
			try {
				serviceAccount = JSON.parse(serviceAccountJson);
			} catch {
				// Try to strip enclosing quotes if present and parse again
				const trimmed = serviceAccountJson.trim();
				const maybe =
					trimmed.startsWith('"') && trimmed.endsWith('"')
						? trimmed.slice(1, -1)
						: trimmed;
				try {
					serviceAccount = JSON.parse(maybe);
				} catch {
					console.warn(
						"Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON - admin SDK not initialized"
					);
					return;
				}
			}

			if (!serviceAccount) {
				console.warn(
					"No service account available - admin SDK not initialized"
				);
				return;
			}

			admin.initializeApp({
				credential: admin.credential.cert(serviceAccount as ServiceAccount),
			});
		}
	} catch (err) {
		// in case admin is partially initialized, log a concise warning
		console.warn(
			"firebase-admin init warning",
			String((err as Error)?.message || err)
		);
		// Also print a helpful hint for common deployment misconfiguration
		console.warn(
			"Hint: ensure FIREBASE_SERVICE_ACCOUNT_JSON is valid JSON or FIREBASE_PRIVATE_KEY/FIREBASE_CLIENT_EMAIL/FIREBASE_PROJECT_ID are set."
		);
	}
}

initAdmin();

export default admin;
