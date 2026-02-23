"use client";

import { useState } from "react";
import type { Skill } from "@/lib/skills";
import { SkillCard } from "./skill-card";
import { Input } from "./ui/input";

interface Props {
	categories: string[];
	marketplaceName: string;
	skills: Skill[];
}

export default function MarketplaceBrowser({
	skills,
	categories,
	marketplaceName,
}: Props) {
	const [query, setQuery] = useState("");
	const [activeCategory, setActiveCategory] = useState<string | null>(null);

	const filtered = skills.filter((skill) => {
		const matchesCategory =
			activeCategory === null || skill.category === activeCategory;
		const q = query.toLowerCase();
		const matchesQuery =
			q === "" ||
			skill.name.toLowerCase().includes(q) ||
			skill.description.toLowerCase().includes(q) ||
			skill.tags.some((t) => t.toLowerCase().includes(q));
		return matchesCategory && matchesQuery;
	});

	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-auto">
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
							No skills match your search.
						</div>
					) : (
						<div className="grid gap-3 sm:grid-cols-2">
							{filtered.map((skill) => (
								<SkillCard
									key={skill.slug}
									marketplaceName={marketplaceName}
									skill={skill}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
