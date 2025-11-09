"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function RouteLoader() {
	const pathname = usePathname();
	const prev = useRef<string | null>(null);
	const [visible, setVisible] = useState(false);
	const hideTimer = useRef<number | null>(null);

	useEffect(() => {
		if (prev.current === null) {
			prev.current = pathname;
			return;
		}
		if (pathname !== prev.current) {
			// start loader
			setVisible(true);
			if (hideTimer.current) window.clearTimeout(hideTimer.current);
			// hide after a reasonable timeout; real navigation often finishes quickly
			hideTimer.current = window.setTimeout(() => setVisible(false), 700);
			prev.current = pathname;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname]);

	useEffect(() => {
		return () => {
			if (hideTimer.current) window.clearTimeout(hideTimer.current);
		};
	}, []);

	if (!visible) return null;

	return (
		<div className="fixed left-0 top-0 w-full z-50">
			<div className="h-1 bg-gradient-to-r from-green-400 via-green-500 to-blue-500 animate-[progress_1.2s_ease-in-out]" />
			<style>{`@keyframes progress{0%{transform:translateX(-100%)}100%{transform:translateX(0)}}`}</style>
		</div>
	);
}
