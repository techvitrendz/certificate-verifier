"use client";
import { useState } from "react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

type VerifyData = {
	name?: string;
	reason?: string;
	dateIssued?: string;
	valid?: boolean;
};

type VerifyResult = { found?: boolean; data?: VerifyData; error?: string };

export default function Home() {
	const [id, setId] = useState("");
	const [result, setResult] = useState<VerifyResult | null>(null);
	const [loading, setLoading] = useState(false);

	async function onVerify(e?: React.FormEvent) {
		e?.preventDefault();
		setLoading(true);
		setResult(null);
		try {
			const res = await fetch("/api/verify", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id }),
			});
			const data = (await res.json()) as VerifyResult;
			setResult(data);
		} catch (err) {
			setResult({ error: String(err) });
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-8 bg-background">
			<main className="mx-auto w-full max-w-5xl rounded-xl bg-card text-card-foreground p-10 shadow-lg ring-1 ring-sidebar-border">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
					<section className="space-y-4 px-4">
						<h1 className="text-4xl font-extrabold tracking-tight">
							Welcome to VITrendz
						</h1>
						<p className="text-base leading-relaxed">
							Verify official VITrendz certificates instantly. Paste a
							certificate ID into the verification box and we will confirm
							whether it was issued by VITrendz and is currently valid.
						</p>

						<ul className="text-sm mt-4 space-y-2">
							<li className="flex items-start gap-2">
								• Fast, tamper-resistant verification
							</li>
							<li className="flex items-start gap-2">
								• Contact support at{" "}
								<a href="mailto:support@vitrendz.example" className="underline">
									support@vitrendz.example
								</a>
							</li>
						</ul>
					</section>

					<section className="px-4">
						<form onSubmit={onVerify} className="flex flex-col gap-4">
							<label className="text-sm font-medium">
								Verify certificate ID
							</label>
							<Input
								placeholder="Enter certificate ID (e.g. a1b2c3d4-...)"
								value={id}
								onChange={(e) => setId(e.target.value)}
								className="shadow-sm transition-all duration-150 py-3"
							/>

							<div className="flex gap-3">
								<Button
									type="submit"
									disabled={loading || !id}
									className="transform transition hover:scale-105 px-6 py-3"
								>
									{loading ? "Checking..." : "Verify"}
								</Button>
								<Button
									type="button"
									className="bg-zinc-100 text-zinc-800 hover:bg-zinc-200 transition px-4 py-3"
									onClick={() => {
										setId("");
										setResult(null);
									}}
								>
									Clear
								</Button>
							</div>

							<div className="mt-4">
								{result ? (
									result.error ? (
										<div className="text-red-600">{result.error}</div>
									) : result.found ? (
										<div className="space-y-2 p-4 rounded-md bg-green-50 border border-green-100">
											<div className="text-green-700 font-semibold">
												Certificate valid
											</div>
											<div className="text-sm">Name: {result.data?.name}</div>
											<div className="text-sm">
												Reason: {result.data?.reason}
											</div>
											<div className="text-sm">
												Date: {formatDate(result.data?.dateIssued)}
											</div>
										</div>
									) : (
										<div className="text-orange-600 p-4 rounded-md bg-orange-50 border border-orange-100">
											Certificate not found or invalid
										</div>
									)
								) : (
									<div className="text-muted">Paste an ID and click Verify</div>
								)}
							</div>
						</form>
					</section>
				</div>
			</main>
		</div>
	);
}

function formatDate(value?: string | null) {
	if (!value) return "-";
	try {
		const d = new Date(value);
		return d.toLocaleString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return String(value);
	}
}
