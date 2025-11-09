import { cn } from "@/lib/utils";

export default function Input({
	className = "",
	...props
}: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
	return (
		<input
			className={cn(
				"w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2",
				className
			)}
			{...props}
		/>
	);
}
