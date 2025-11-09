import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// header intentionally removed per product requirement
import Footer from "@/components/ui/footer";
import RouteLoader from "@/components/ui/route-loader";
import AppToaster from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Vitrendz Certificates",
	description: "Verify certificates issued by Vitrendz",
};

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50`}
			>
				<Analytics />
				<RouteLoader />
				<AppToaster />
				<main className="min-h-[70vh]">{children}</main>
				<Footer />
			</body>
		</html>
	);
}
