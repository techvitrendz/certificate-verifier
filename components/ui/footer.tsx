export default function Footer() {
	return (
		<footer className="w-full border-t bg-white/50 mt-12">
			<div className="mx-auto max-w-6xl p-6 text-center text-sm text-zinc-600">
				<div className="mb-2">© {new Date().getFullYear()} Vitrendz</div>
				<div className="flex flex-col md:flex-row md:justify-center md:gap-6 gap-2">
					<a
						className="hover:underline"
						href="https://www.vitrendz.in/"
						target="_blank"
						rel="noreferrer noopener"
					>
						Vitrendz
					</a>
					<a
						className="hover:underline"
						href="https://ffcs.vitrendz.in/"
						target="_blank"
						rel="noreferrer noopener"
					>
						FFCS
					</a>
					<a
						className="hover:underline"
						href="https://cgpa-calculator.vitrendz.in/"
						target="_blank"
						rel="noreferrer noopener"
					>
						CGPA Calculator
					</a>
				</div>

				<div className="mt-3">
					Need help? Email{" "}
					<a className="underline" href="mailto:tech.vitrendz@gmail.com">
						tech.vitrendz@gmail.com
					</a>
				</div>
			</div>
		</footer>
	);
}
