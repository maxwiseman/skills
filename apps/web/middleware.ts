import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	if (request.nextUrl.pathname !== "/") {
		return NextResponse.next();
	}

	const accept = request.headers.get("accept") ?? "";
	const isJsonRequest =
		accept.includes("application/json") && !accept.includes("text/html");

	if (isJsonRequest) {
		return NextResponse.rewrite(new URL("/api/marketplace", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/"],
};
