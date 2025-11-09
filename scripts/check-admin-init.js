// Diagnostic script - run locally to check firebase-admin initialization
// Usage: node scripts/check-admin-init.js

(async () => {
	try {
		const present = {
			SERVICE_JSON: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
			PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
			CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
			PROJECT_ID: !!process.env.FIREBASE_PROJECT_ID,
		};

		console.log("Env presence:", present);

		// Basic checks on private key format if present
		if (process.env.FIREBASE_PRIVATE_KEY) {
			const pk = process.env.FIREBASE_PRIVATE_KEY;
			const hasBegin = pk.includes("-----BEGIN PRIVATE KEY-----");
			const hasEscapedNewlines = pk.includes("\\n");
			console.log(
				"PRIVATE_KEY: hasBegin=",
				hasBegin,
				"hasEscapedNewlines=",
				hasEscapedNewlines,
				"length=",
				pk.length
			);
		}

		// Attempt to assemble serviceAccount
		let serviceAccount = null;
		if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
			try {
				serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
				console.log(
					"Parsed FIREBASE_SERVICE_ACCOUNT_JSON OK. project_id=",
					serviceAccount.project_id || "<none>"
				);
			} catch (e) {
				// try strip wrapping quotes
				const trimmed = process.env.FIREBASE_SERVICE_ACCOUNT_JSON.trim();
				const maybe =
					trimmed.startsWith('"') && trimmed.endsWith('"')
						? trimmed.slice(1, -1)
						: trimmed;
				try {
					serviceAccount = JSON.parse(maybe);
					console.log(
						"Parsed FIREBASE_SERVICE_ACCOUNT_JSON after trimming wrapper. project_id=",
						serviceAccount.project_id || "<none>"
					);
				} catch (e2) {
					console.log("Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON");
				}
			}
		}

		if (
			!serviceAccount &&
			process.env.FIREBASE_PRIVATE_KEY &&
			process.env.FIREBASE_CLIENT_EMAIL &&
			process.env.FIREBASE_PROJECT_ID
		) {
			const key = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
			serviceAccount = {
				private_key: key,
				client_email: process.env.FIREBASE_CLIENT_EMAIL,
				project_id: process.env.FIREBASE_PROJECT_ID,
			};
			console.log(
				"Built serviceAccount from PRIVATE_KEY/CLIENT_EMAIL/PROJECT_ID"
			);
		}

		const admin = require("firebase-admin");
		if (!serviceAccount) {
			console.log("No service account available - cannot initialize admin SDK");
			console.log(
				"If you have serviceAccount JSON file, you can run the Node helper to emit env lines."
			);
			process.exit(1);
		}

		try {
			if (!admin.apps.length) {
				admin.initializeApp({
					credential: admin.credential.cert(serviceAccount),
				});
			}
			console.log("admin.apps.length=", admin.apps.length);
			// Test a simple call (auth listUsers is admin-only and won't return secrets); limit to 1
			try {
				// do not call listUsers in case permissions are limited; instead just check firestore access
				const db = admin.firestore();
				await db.collection("certificates").limit(1).get();
				console.log("Firestore read test: OK");
			} catch (e) {
				console.log("Firestore read test error:", String(e.message || e));
			}
		} catch (e) {
			console.log("Failed to initialize admin SDK:", String(e.message || e));
		}
	} catch (err) {
		console.error("Diagnostic script error:", String(err));
		process.exit(1);
	}
})();
