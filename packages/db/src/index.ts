import { neon } from "@neondatabase/serverless";
import { env } from "@skills/env/server";
import { drizzle } from "drizzle-orm/neon-http";
import { account, session, user, verification } from "./schema";

const schema = { account, session, user, verification };

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });
