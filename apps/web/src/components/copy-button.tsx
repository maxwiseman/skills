"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface Props {
	text: string;
}

export default function CopyButton({ text }: Props) {
	const [copied, setCopied] = useState(false);

	function handleCopy() {
		navigator.clipboard.writeText(text).then(
			() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			},
			() => undefined
		);
	}

	return (
		<button
			aria-label="Copy to clipboard"
			className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
			onClick={handleCopy}
			type="button"
		>
			{copied ? (
				<Check className="h-3.5 w-3.5 text-green-500" />
			) : (
				<Copy className="h-3.5 w-3.5" />
			)}
		</button>
	);
}
