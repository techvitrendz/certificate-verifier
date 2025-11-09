(async () => {
	const fs = require("fs");
	const path = "./.env.local";
	if (!fs.existsSync(path)) {
		console.error("no .env.local file");
		process.exit(1);
	}
	const c = fs.readFileSync(path, "utf8");
	const m = c.match(/NEXT_PUBLIC_FIREBASE_API_KEY\s*=\s*\"?([^\"\n]+)\"?/);
	if (!m) {
		console.error("no api key found in .env.local");
		process.exit(1);
	}
	const apiKey = m[1].trim();

	const email = "tech.vitrendz@gmail.com";
	const pwd = "P@ssw0rd";

	console.log("Signing in...");
	try {
		const signRes = await fetch(
			`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password: pwd, returnSecureToken: true }),
			}
		);
		const signJson = await signRes.json();
		if (!signJson.idToken) {
			console.error("Sign-in failed:", JSON.stringify(signJson));
			process.exit(1);
		}
		const idToken = signJson.idToken;

		console.log("Calling /api/admin/list");
		try {
			const listRes = await fetch("http://localhost:3000/api/admin/list", {
				headers: { Authorization: `Bearer ${idToken}` },
			});
			const listText = await listRes.text();
			console.log("list status", listRes.status);
			console.log(listText);
		} catch (err) {
			console.error("list request error", String(err));
		}

		console.log("Calling /api/admin/add");
		try {
			const addRes = await fetch("http://localhost:3000/api/admin/add", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${idToken}`,
				},
				body: JSON.stringify({
					name: "Automated Test",
					reason: "smoke test",
					dateIssued: new Date().toISOString(),
				}),
			});
			const addText = await addRes.text();
			console.log("add status", addRes.status);
			console.log(addText);
		} catch (err) {
			console.error("add request error", String(err));
		}
	} catch (e) {
		console.error("script error", String(e));
		process.exit(1);
	}
})();
