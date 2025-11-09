"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { auth } from "@/lib/firebaseClient";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Table from "@/components/ui/table";
import Empty from "@/components/ui/empty";
import {
	Dialog,
	DialogTrigger,
	DialogPortal,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";

type Cert = {
	id: string;
	name: string;
	reason?: string;
	dateIssued?: string;
	valid?: boolean;
};

export default function AdminPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [token, setToken] = useState<string | null>(null);
	const [items, setItems] = useState<Cert[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");

	useEffect(() => {
		const t = setTimeout(() => setDebouncedQuery(searchQuery), 200);
		return () => clearTimeout(t);
	}, [searchQuery]);
	const [loading, setLoading] = useState(false);
	const [listLoading, setListLoading] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmTarget, setConfirmTarget] = useState<string | null>(null);
	const [confirmAction, setConfirmAction] = useState<
		"invalidate" | "validate" | "delete"
	>("invalidate");
	const [addOpen, setAddOpen] = useState(false);
	const [newName, setNewName] = useState("");
	const [newReason, setNewReason] = useState("");
	const [newDate, setNewDate] = useState(() => {
		const d = new Date();
		const yyyy = d.getFullYear();
		const mm = String(d.getMonth() + 1).padStart(2, "0");
		const dd = String(d.getDate()).padStart(2, "0");
		return `${yyyy}-${mm}-${dd}`;
	});

	// edit dialog state
	const [editOpen, setEditOpen] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [editName, setEditName] = useState("");
	const [editReason, setEditReason] = useState("");
	const [editDate, setEditDate] = useState(() => {
		const d = new Date();
		const yyyy = d.getFullYear();
		const mm = String(d.getMonth() + 1).padStart(2, "0");
		const dd = String(d.getDate()).padStart(2, "0");
		return `${yyyy}-${mm}-${dd}`;
	});

	async function doSignIn(e?: React.FormEvent) {
		e?.preventDefault();
		setLoading(true);
		try {
			const cred = await signInWithEmailAndPassword(auth, email, password);
			const t = await cred.user.getIdToken();
			setToken(t);
			await loadList(t);
		} catch (err) {
			console.error(err);
			toast.error("Sign in failed");
		} finally {
			setLoading(false);
		}
	}

	async function loadList(t: string) {
		try {
			setListLoading(true);
			const res = await fetch("/api/admin/list", {
				headers: { Authorization: `Bearer ${t}` },
			});
			const data = await res.json();
			if (data?.items) setItems(data.items || []);
		} catch (err) {
			console.error(err);
			toast.error("Failed loading list");
		} finally {
			setListLoading(false);
		}
	}

	// Derived filtered list by name (case-insensitive) using debounced query
	const filteredItems = items.filter((it) => {
		if (!debouncedQuery) return true;
		try {
			return String(it.name || "")
				.toLowerCase()
				.includes(debouncedQuery.toLowerCase());
		} catch {
			return false;
		}
	});

	async function doAddSubmit(e?: React.FormEvent) {
		e?.preventDefault();
		if (!newName) return toast.error("Name is required");
		try {
			const res = await fetch("/api/admin/add", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					name: newName,
					reason: newReason,
					dateIssued: new Date(newDate).toISOString(),
				}),
			});
			const data = await res.json();
			if (data?.ok) {
				setAddOpen(false);
				setNewName("");
				setNewReason("");
				setNewDate(() => {
					const d = new Date();
					const yyyy = d.getFullYear();
					const mm = String(d.getMonth() + 1).padStart(2, "0");
					const dd = String(d.getDate()).padStart(2, "0");
					return `${yyyy}-${mm}-${dd}`;
				});
				loadList(token as string);
				if (data.id) toast.success("Created certificate id: " + data.id);
			} else {
				toast.error("Add failed: " + JSON.stringify(data));
			}
		} catch (err) {
			console.error(err);
			toast.error("Add failed");
		}
	}

	function openConfirm(
		action: "invalidate" | "validate" | "delete",
		id: string
	) {
		setConfirmAction(action);
		setConfirmTarget(id);
		setConfirmOpen(true);
	}

	function openEdit(cert: Cert) {
		setEditId(cert.id as string);
		setEditName(cert.name || "");
		setEditReason(cert.reason || "");
		setEditDate(() => {
			try {
				if (cert.dateIssued) {
					const d = new Date(cert.dateIssued);
					const yyyy = d.getFullYear();
					const mm = String(d.getMonth() + 1).padStart(2, "0");
					const dd = String(d.getDate()).padStart(2, "0");
					return `${yyyy}-${mm}-${dd}`;
				}
			} catch {}
			const d = new Date();
			const yyyy = d.getFullYear();
			const mm = String(d.getMonth() + 1).padStart(2, "0");
			const dd = String(d.getDate()).padStart(2, "0");
			return `${yyyy}-${mm}-${dd}`;
		});
		setEditOpen(true);
	}

	async function doConfirmAction(
		id: string,
		action: "invalidate" | "validate" | "delete"
	) {
		// used for invalidate/validate/delete actions
		setConfirmOpen(false);
		try {
			const endpoint =
				action === "invalidate"
					? "/api/admin/invalidate"
					: action === "validate"
					? "/api/admin/validate"
					: "/api/admin/delete";
			const res = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ id }),
			});
			const data = await res.json();
			if (data?.ok) {
				toast.success(
					(action === "invalidate"
						? "Invalidated "
						: action === "validate"
						? "Validated "
						: "Deleted ") + id
				);
				loadList(token as string);
			} else {
				toast.error(
					(action === "invalidate"
						? "Invalidate"
						: action === "validate"
						? "Validate"
						: "Delete") +
						" failed: " +
						JSON.stringify(data)
				);
			}
		} catch (err) {
			console.error(err);
			toast.error("Action failed");
		}
	}

	async function doEditSubmit(e?: React.FormEvent) {
		e?.preventDefault();
		if (!editId) return toast.error("No certificate selected");
		if (!editName) return toast.error("Name is required");
		try {
			const res = await fetch("/api/admin/update", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					id: editId,
					name: editName,
					reason: editReason,
					dateIssued: new Date(editDate).toISOString(),
				}),
			});
			const data = await res.json();
			if (data?.ok) {
				setEditOpen(false);
				setEditId(null);
				loadList(token as string);
				toast.success("Updated " + editId);
			} else {
				toast.error("Update failed: " + JSON.stringify(data));
			}
		} catch (err) {
			console.error(err);
			toast.error("Update failed");
		}
	}

	return (
		<div className="min-h-screen p-8">
			<div className="mx-auto max-w-5xl bg-card text-card-foreground p-6 rounded-lg">
				<h1 className="text-2xl font-semibold mb-4">
					Admin - Certificate Manager
				</h1>

				{!token ? (
					<form onSubmit={doSignIn} className="flex gap-2">
						<Input
							placeholder="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<Input
							placeholder="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<Button disabled={loading} className="shadow-md">
							{loading ? "Signing..." : "Sign in"}
						</Button>
					</form>
				) : (
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Dialog open={addOpen} onOpenChange={setAddOpen}>
								<DialogTrigger>
									<Button className="bg-green-600 shadow-md">
										Add Certificate
									</Button>
								</DialogTrigger>
								<DialogPortal>
									<form onSubmit={doAddSubmit} className="space-y-4 p-4">
										<DialogTitle>Add Certificate</DialogTitle>
										<DialogDescription>
											Provide certificate details
										</DialogDescription>
										<Input
											placeholder="Date issued"
											type="date"
											value={newDate}
											onChange={(e) => setNewDate(e.target.value)}
										/>
										<Input
											placeholder="Name"
											value={newName}
											onChange={(e) => setNewName(e.target.value)}
										/>
										<Input
											placeholder="Reason"
											value={newReason}
											onChange={(e) => setNewReason(e.target.value)}
										/>
										<div className="flex gap-2 justify-end">
											<Button
												type="button"
												onClick={() => setAddOpen(false)}
												className="bg-zinc-300 text-black shadow-sm"
											>
												Cancel
											</Button>
											<Button type="submit" className="shadow-md">
												Add
											</Button>
										</div>
									</form>
								</DialogPortal>
							</Dialog>

							{/* Edit dialog */}
							<Dialog open={editOpen} onOpenChange={setEditOpen}>
								<DialogPortal>
									<form onSubmit={doEditSubmit} className="space-y-4 p-4">
										<DialogTitle>Edit Certificate</DialogTitle>
										<DialogDescription>
											Update certificate details
										</DialogDescription>
										<Input
											placeholder="Date issued"
											type="date"
											value={editDate}
											onChange={(e) => setEditDate(e.target.value)}
										/>
										<Input
											placeholder="Name"
											value={editName}
											onChange={(e) => setEditName(e.target.value)}
										/>
										<Input
											placeholder="Reason"
											value={editReason}
											onChange={(e) => setEditReason(e.target.value)}
										/>
										<div className="flex gap-2 justify-end">
											<Button
												type="button"
												onClick={() => setEditOpen(false)}
												className="bg-zinc-300 text-black shadow-sm"
											>
												Cancel
											</Button>
											<Button type="submit" className="shadow-md">
												Save
											</Button>
										</div>
									</form>
								</DialogPortal>
							</Dialog>

							<Button
								className="bg-red-600 shadow-md"
								onClick={async () => {
									await signOut(auth);
									setToken(null);
									setItems([]);
								}}
							>
								Sign out
							</Button>
						</div>

						<div className="bg-white rounded p-4 shadow">
							<div className="flex items-center justify-between mb-3">
								<h2 className="font-semibold">Issued Certificates</h2>
								<div className="w-64">
									<Input
										placeholder="Search by name"
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="w-full"
									/>
								</div>
							</div>
							{listLoading ? (
								<div className="p-4">Loading certificates...</div>
							) : items.length === 0 ? (
								<Empty
									title="No certificates"
									description="Add certificates using the Add button."
								/>
							) : filteredItems.length === 0 && debouncedQuery ? (
								<div className="p-4 text-sm text-zinc-600">{`No results for "${debouncedQuery}"`}</div>
							) : (
								<Table
									columns={[
										{ key: "id", label: "ID" },
										{ key: "name", label: "Name" },
										{ key: "reason", label: "Reason" },
										{
											key: "dateIssued",
											label: "Date Issued",
											render: (r: Cert) => formatDate(r.dateIssued),
										},
										{
											key: "valid",
											label: "Valid",
											render: (r: Cert) => String(r.valid),
										},
										{
											key: "_actions",
											label: "",
											render: (r: Cert) => (
												<div className="flex items-center gap-2">
													<Button
														className={
															(r.valid ? "bg-orange-500" : "bg-green-600") +
															" shadow-sm"
														}
														onClick={() =>
															openConfirm(
																r.valid ? "invalidate" : "validate",
																String(r.id)
															)
														}
													>
														{r.valid ? "Invalidate" : "Validate"}
													</Button>
													<Button
														className="bg-yellow-500 shadow-sm"
														onClick={() => openEdit(r)}
													>
														Edit
													</Button>
													<Button
														className="bg-red-600 shadow-sm"
														onClick={() => openConfirm("delete", String(r.id))}
													>
														Delete
													</Button>
												</div>
											),
										},
									]}
									data={filteredItems}
								/>
							)}
						</div>
					</div>
				)}
			</div>

			{/* confirmation dialog for validate/invalidate */}
			<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<DialogPortal>
					<div className="fixed inset-0 flex items-center justify-center p-4">
						<div className="bg-white p-6 rounded shadow max-w-md w-full">
							<DialogTitle>
								{confirmAction === "invalidate"
									? "Confirm Invalidate"
									: confirmAction === "validate"
									? "Confirm Validate"
									: "Confirm Delete"}
							</DialogTitle>
							<DialogDescription>
								{confirmAction === "invalidate"
									? "Are you sure you want to invalidate this certificate?"
									: confirmAction === "validate"
									? "Are you sure you want to validate this certificate?"
									: "Are you sure you want to delete this certificate? This action cannot be undone."}
							</DialogDescription>
							<div className="mt-4 flex justify-end gap-2">
								<Button
									type="button"
									onClick={() => setConfirmOpen(false)}
									className="bg-zinc-300 text-black"
								>
									Cancel
								</Button>
								<Button
									onClick={() => {
										if (confirmTarget)
											doConfirmAction(confirmTarget, confirmAction);
									}}
								>
									Confirm
								</Button>
							</div>
						</div>
					</div>
				</DialogPortal>
			</Dialog>
		</div>
	);
}

function formatDate(value?: string | null) {
	if (!value) return "-";
	try {
		const d = new Date(value);
		return d.toLocaleString(undefined, {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return String(value);
	}
}
