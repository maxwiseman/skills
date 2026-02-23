"use client";

import { code } from "@streamdown/code";
import { Streamdown } from "streamdown";

interface Props {
	content: string;
}

export default function SkillContent({ content }: Props) {
	return <Streamdown plugins={{ code }}>{content}</Streamdown>;
}
