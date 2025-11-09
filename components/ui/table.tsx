import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/button";

type Column<T> = {
	key: string;
	label: string;
	render?: (row: T) => ReactNode;
};

export default function Table<T>({
	columns,
	data,
	className = "",
}: {
	columns: Column<T>[];
	data: T[];
	className?: string;
}) {
	return (
		<div
			className={cn("overflow-x-auto rounded-md border bg-white", className)}
		>
			<table className="w-full table-auto text-sm">
				<thead className="bg-zinc-50 text-left text-xs text-zinc-600">
					<tr>
						{columns.map((c) => (
							<th key={c.key} className="whitespace-nowrap px-4 py-3">
								{c.label}
							</th>
						))}
						{!columns.find((c) => c.key === "_actions") && (
							<th className="px-4 py-3">Actions</th>
						)}
					</tr>
				</thead>
				<tbody>
					{data.map((row: any, idx) => (
						<tr key={idx} className={idx % 2 === 0 ? "" : "bg-zinc-50"}>
							{columns.map((c) => (
								<td key={c.key} className="px-4 py-3 align-top">
									{c.render ? c.render(row) : String((row as any)[c.key] ?? "")}
								</td>
							))}
							{!columns.find((c) => c.key === "_actions") && (
								<td className="px-4 py-3 align-top">
									<Button className="bg-orange-500">Action</Button>
								</td>
							)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
