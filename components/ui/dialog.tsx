"use client";
import * as RadixDialog from "@radix-ui/react-dialog";
import { ReactNode } from "react";

export function Dialog({
	children,
	open,
	onOpenChange,
}: {
	children: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	return (
		<RadixDialog.Root open={open} onOpenChange={onOpenChange}>
			{children}
		</RadixDialog.Root>
	);
}

export function DialogTrigger({ children }: { children: ReactNode }) {
	return <RadixDialog.Trigger asChild>{children}</RadixDialog.Trigger>;
}

export function DialogPortal({ children }: { children: ReactNode }) {
	return (
		<RadixDialog.Portal>
			<RadixDialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
			<RadixDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
				{children}
				<RadixDialog.Close className="absolute right-3 top-3 text-zinc-500">
					✕
				</RadixDialog.Close>
			</RadixDialog.Content>
		</RadixDialog.Portal>
	);
}

export function DialogTitle({ children }: { children: ReactNode }) {
	return (
		<RadixDialog.Title className="text-lg font-semibold">
			{children}
		</RadixDialog.Title>
	);
}

export function DialogDescription({ children }: { children: ReactNode }) {
	return (
		<RadixDialog.Description className="text-sm text-zinc-500">
			{children}
		</RadixDialog.Description>
	);
}
