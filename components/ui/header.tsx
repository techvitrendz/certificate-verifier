import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function Header() {
	return (
		<header className="w-full border-b bg-white/60 backdrop-blur-sm">
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4">
				<Link href="/" className="flex items-center gap-3">
					<Image src="/logo.png" alt="Logo" width={36} height={36} />
					<div className="text-lg font-semibold">Vitrendz Certificates</div>
				</Link>

				<nav className="hidden items-center gap-3 md:flex">
					<Link
						href="/verify"
						className="rounded-md px-3 py-1 text-sm hover:bg-zinc-100"
					>
						Verify
					</Link>
					<Link
						href="/admin"
						className="rounded-md px-3 py-1 text-sm hover:bg-zinc-100"
					>
						Admin
					</Link>
				</nav>

				<div className="md:hidden">
					<Button aria-label="menu">
						<Menu size={16} />
					</Button>
				</div>
			</div>
		</header>
	);
}
