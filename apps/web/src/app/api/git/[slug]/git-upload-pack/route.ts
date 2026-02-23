import { buildRepo, buildUploadPackResponse } from "@/lib/git";
import { getSkillGitFiles, getSkills } from "@/lib/skills";

export const dynamic = "force-dynamic";

export async function POST(
	_request: Request,
	{ params }: { params: Promise<{ slug: string }> }
) {
	const { slug } = await params;

	const skill = getSkills().find((s) => s.slug === slug);
	if (!skill) {
		return new Response("Not Found", { status: 404 });
	}

	const files = getSkillGitFiles(slug, skill);
	const { objects } = buildRepo(files);
	const body = buildUploadPackResponse(objects);

	// Buffer is a Uint8Array at runtime; cast needed due to ArrayBufferLike vs ArrayBuffer
	return new Response(body as unknown as BodyInit, {
		headers: {
			"Content-Type": "application/x-git-upload-pack-result",
			"Cache-Control": "no-cache",
		},
	});
}
