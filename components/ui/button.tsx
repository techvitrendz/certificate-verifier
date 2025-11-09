import { cn } from "@/lib/utils";

export default function Button({
	children,
	className = "",
	...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<button
			className={cn(
				"inline-flex items-center cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium hover:opacity-95 disabled:opacity-50 transition-transform transform-gpu hover:scale-105 active:scale-95 btn-primary",
				className
			)}
			{...props}
		>
			{children}
		</button>
	);
}
