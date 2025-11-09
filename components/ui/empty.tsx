export default function Empty({
	title = "Nothing here",
	description,
}: {
	title?: string;
	description?: string;
}) {
	return (
		<div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-zinc-500">
			<div className="text-2xl font-semibold">{title}</div>
			{description ? <div className="text-sm">{description}</div> : null}
		</div>
	);
}
