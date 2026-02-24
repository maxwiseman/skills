"use client";

import { useEffect, useMemo, useState } from "react";
import CopyButton from "@/components/copy-button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useInstallPreferenceStore } from "@/stores/install-preference-store";

interface Props {
	marketplaceName: string;
	showSelector?: boolean;
	skillSlug: string;
}

const UNKNOWN_ORIGIN = "<marketplace-url>";

export default function InstallCommandBox({
	marketplaceName,
	showSelector = true,
	skillSlug,
}: Props) {
	const installer = useInstallPreferenceStore((state) => state.installer);
	const setInstaller = useInstallPreferenceStore((state) => state.setInstaller);
	const [origin, setOrigin] = useState<string>(UNKNOWN_ORIGIN);

	useEffect(() => {
		setOrigin(window.location.origin);
	}, []);

	const installCmd = useMemo(() => {
		if (installer === "claude") {
			return `/plugin install ${skillSlug}@${marketplaceName}`;
		}

		const repoUrl = `${origin}/api/git/${skillSlug}.git`;
		return `$skill-installer ${repoUrl}`;
	}, [installer, marketplaceName, origin, skillSlug]);

	return (
		<div className="relative z-10 flex items-center gap-2 rounded-lg border bg-muted/40 px-2.5 py-1.5">
			<code className="flex-1 truncate font-mono text-muted-foreground text-xs sm:text-sm">
				{installCmd}
			</code>
			{showSelector && (
				<Select
					items={{ claude: "Claude", codex: "Codex" }}
					onValueChange={(value) => setInstaller(value as "claude" | "codex")}
					value={installer}
				>
					<SelectTrigger
						aria-label="Choose installer"
						className="border-none bg-transparent! text-muted-foreground hover:**:text-primary"
						size="sm"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent align="end">
						<SelectGroup>
							<SelectItem value="claude">Claude</SelectItem>
							<SelectItem value="codex">Codex</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			)}
			<CopyButton text={installCmd} />
		</div>
	);
}
