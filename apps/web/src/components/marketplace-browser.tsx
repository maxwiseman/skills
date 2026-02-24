"use client";

import { useState } from "react";
import type { Plugin } from "@/lib/skills";
import { SkillCard } from "./skill-card";
import { Input } from "./ui/input";

interface Props {
	categories: string[];
	marketplaceName: string;
	plugins: Plugin[];
}

export default function MarketplaceBrowser({
	plugins,
	categories,
	marketplaceName,
}: Props) {
	const [query, setQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState<string | null>(null);

	const filtered = plugins.filter((plugin) => {
		const matchesCategory =
			activeCategory === null || plugin.category === activeCategory;
		const q = query.toLowerCase();
		const matchesQuery =
			q === "" ||
			plugin.name.toLowerCase().includes(q) ||
			plugin.description.toLowerCase().includes(q) ||
			plugin.tags.some((t) => t.toLowerCase().includes(q));
		return matchesCategory && matchesQuery;
	});

	return (
		<div className="flex flex-col">
			<div className="sticky top-0 z-10 border-b bg-background px-6 py-3">
				<div className="mx-auto max-w-4xl space-y-3">
					<Input
						aria-label="Search skills"
						className="h-8 text-sm"
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search skills..."
						value={query}
					/>
					<div className="flex flex-wrap gap-2">
						<button
							className={`rounded-full border px-3 py-0.5 text-xs transition-colors ${
								activeCategory === null
									? "border-foreground bg-foreground text-background"
									: "border-border hover:border-foreground/50"
							}`}
							onClick={() => setActiveCategory(null)}
							type="button"
						>
							All
						</button>
						{categories.map((cat) => (
							<button
								className={`rounded-full border px-3 py-0.5 text-xs capitalize transition-colors ${
									activeCategory === cat
										? "border-foreground bg-foreground text-background"
										: "border-border hover:border-foreground/50"
								}`}
								key={cat}
								onClick={() =>
									setActiveCategory(activeCategory === cat ? null : cat)
								}
								type="button"
							>
								{cat}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="flex-1 px-6 py-6">
				<div className="mx-auto max-w-4xl">
					{filtered.length === 0 ? (
						<div className="py-16 text-center text-muted-foreground text-sm">
							No plugins match your search.
						</div>
					) : (
						<div className="grid gap-3 sm:grid-cols-2">
							{filtered.map((plugin) => (
								<SkillCard
									key={plugin.slug}
									marketplaceName={marketplaceName}
									plugin={plugin}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
