// Usage: node scripts/generate-env-from-sa.js path/to/serviceAccountKey.json
// Prints three lines suitable for pasting into .env.local
const fs = require("fs");
const p = process.argv[2] || "./serviceAccountKey.json";
if (!fs.existsSync(p)) {
	console.error("file not found:", p);
	process.exit(1);
}
try {
	const j = JSON.parse(fs.readFileSync(p, "utf8"));
	const pk = (j.private_key || "").replace(/\n/g, "\\n");
	console.log(`FIREBASE_PRIVATE_KEY=\"${pk}\"`);
	console.log(`FIREBASE_CLIENT_EMAIL=\"${j.client_email}\"`);
	console.log(`FIREBASE_PROJECT_ID=\"${j.project_id}\"`);
} catch (e) {
	console.error("failed to parse json:", e.message || e);
	process.exit(1);
}
