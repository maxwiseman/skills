"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { File, FileText, Folder, FolderOpen, X } from "lucide-react";
import { useState } from "react";
import type { PluginFile } from "@/lib/skills";
import CopyButton from "./copy-button";
import SkillContent from "./skill-content";

interface TreeNode {
	children: TreeNode[];
	content: string;
	name: string;
	path: string;
	type: "file" | "dir";
}

function buildTree(files: PluginFile[]): TreeNode[] {
	const root: TreeNode[] = [];

	for (const file of files) {
		const parts = file.path.split("/");
		let nodes = root;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i] as string;
			const isLast = i === parts.length - 1;

			if (isLast) {
				nodes.push({
					name: part,
					path: file.path,
					type: "file",
					children: [],
					content: file.content,
				});
			} else {
				let dir = nodes.find((n) => n.name === part && n.type === "dir");
				if (!dir) {
					dir = {
						name: part,
						path: parts.slice(0, i + 1).join("/"),
						type: "dir",
						children: [],
						content: "",
					};
					nodes.push(dir);
				}
				nodes = dir.children;
			}
		}
	}

	return root;
}

interface FileTreeNodeProps {
	depth: number;
	node: TreeNode;
	onFileClick: (node: TreeNode) => void;
}

function FileTreeNode({ node, depth, onFileClick }: FileTreeNodeProps) {
	const [expanded, setExpanded] = useState(depth === 0);
	const paddingLeft = 12 + depth * 14;

	if (node.type === "dir") {
		const DirIcon = expanded ? FolderOpen : Folder;
		return (
			<div>
				<button
					className="flex w-full items-center gap-1.5 py-0.5 text-left text-muted-foreground text-sm hover:bg-muted/50"
					onClick={() => setExpanded((e) => !e)}
					style={{ paddingLeft }}
					type="button"
				>
					<DirIcon className="size-3.5 shrink-0" />
					<span className="font-mono">{node.name}</span>
				</button>
				{expanded &&
					node.children.map((child) => (
						<FileTreeNode
							depth={depth + 1}
							key={child.path}
							node={child}
							onFileClick={onFileClick}
						/>
					))}
			</div>
		);
	}

	const FileIcon = node.name.endsWith(".md") ? FileText : File;

	return (
		<button
			className="flex w-full items-center gap-1.5 py-0.5 text-left text-sm hover:bg-muted/50"
			onClick={() => onFileClick(node)}
			style={{ paddingLeft }}
			type="button"
		>
			<FileIcon className="size-3.5 shrink-0 text-muted-foreground" />
			<span className="font-mono">{node.name}</span>
		</button>
	);
}

interface Props {
	files: PluginFile[];
}

export function SkillFileTree({ files }: Props) {
	const [selected, setSelected] = useState<TreeNode | null>(null);
	const tree = buildTree(files);

	return (
		<>
			<div className="overflow-hidden rounded-lg border bg-card">
				<div className="border-b px-3 py-2">
					<span className="font-medium text-muted-foreground text-xs">
						Files
					</span>
				</div>
				<div className="py-1">
					{tree.map((node) => (
						<FileTreeNode
							depth={0}
							key={node.path}
							node={node}
							onFileClick={setSelected}
						/>
					))}
				</div>
			</div>

			<DialogPrimitive.Root
				onOpenChange={(open) => {
					if (!open) {
						setSelected(null);
					}
				}}
				open={selected !== null}
			>
				<DialogPrimitive.Portal>
					<DialogPrimitive.Backdrop className="data-closed:fade-out-0 data-open:fade-in-0 fixed inset-0 bg-black/50 data-closed:animate-out data-open:animate-in" />
					<DialogPrimitive.Popup className="data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 fixed top-1/2 left-1/2 flex max-h-[80vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border bg-card shadow-xl data-closed:animate-out data-open:animate-in">
						{selected && (
							<>
								<DialogPrimitive.Title className="sr-only">
									{selected.path}
								</DialogPrimitive.Title>
								<div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
									<span className="font-mono text-sm">{selected.path}</span>
									<div className="flex items-center gap-1">
										<CopyButton text={selected.content} />
										<DialogPrimitive.Close className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
											<X className="size-4" />
										</DialogPrimitive.Close>
									</div>
								</div>
								<div className="min-h-0 overflow-auto p-4">
									{selected.name.endsWith(".md") ? (
										<SkillContent content={selected.content} />
									) : (
										<pre className="whitespace-pre-wrap break-all font-mono text-xs">
											{selected.content}
										</pre>
									)}
								</div>
							</>
						)}
					</DialogPrimitive.Popup>
				</DialogPrimitive.Portal>
			</DialogPrimitive.Root>
		</>
	);
}
