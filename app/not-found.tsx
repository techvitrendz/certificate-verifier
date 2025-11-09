"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";

export default function NotFoundPage() {
	const router = useRouter();
	const [count, setCount] = useState(3);

	useEffect(() => {
		const t = setInterval(() => setCount((c) => c - 1), 1000);
		const redirect = setTimeout(() => router.replace("/"), 3000);
		return () => {
			clearInterval(t);
			clearTimeout(redirect);
		};
	}, [router]);

	return (
		<div className="min-h-[70vh] flex items-center justify-center bg-zinc-50 p-8">
			<main className="mx-auto w-full max-w-xl rounded-lg bg-white p-8 shadow-md text-center">
				<h1 className="text-2xl font-bold text-rose-600 mb-2">
					Page Not Found
				</h1>
				<p className="text-zinc-600 mb-4">
					Sorry, we couldn’t find the page you were looking for.
				</p>
				<p className="text-sm text-zinc-500 mb-6">
					You will be redirected to the home page in {count} second
					{count !== 1 ? "s" : ""}.
				</p>

				<div className="flex justify-center gap-3">
					<Button onClick={() => router.replace("/")}>Go home now</Button>
				</div>
			</main>
		</div>
	);
}
