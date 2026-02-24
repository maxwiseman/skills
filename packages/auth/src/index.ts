import { db } from "@skills/db";
import { account, session, user, verification } from "@skills/db/schema/auth";
import { env } from "@skills/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

const schema = { account, session, user, verification };

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",

		schema,
	}),
	trustedOrigins: [env.CORS_ORIGIN],
	emailAndPassword: {
		enabled: true,
	},
	plugins: [nextCookies()],
});
