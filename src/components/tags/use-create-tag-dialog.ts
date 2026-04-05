import { useRef, useState } from "react";

export function useCreateTagDialog(onCreate: (name: string) => Promise<void>) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [created, setCreated] = useState<string[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);

	function reset() {
		setName("");
		setError("");
		setCreated([]);
		setLoading(false);
	}

	async function submit(keepOpen: boolean) {
		setError("");

		if (!name.trim()) {
			setError("Tag name is required");
			return;
		}

		setLoading(true);
		try {
			await onCreate(name.trim());
			if (keepOpen) {
				setCreated((prev) => [...prev, name.trim()]);
				setName("");
				inputRef.current?.focus();
			} else {
				setOpen(false);
				reset();
			}
		} catch {
			setError("Failed to create tag");
		} finally {
			setLoading(false);
		}
	}

	return {
		open,
		name,
		loading,
		error,
		created,
		inputRef,
		setName,
		submit,
		handleOpenChange: (value: boolean) => {
			setOpen(value);
			if (!value) reset();
		},
	};
}
