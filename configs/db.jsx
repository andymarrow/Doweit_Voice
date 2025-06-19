import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon("postgresql://Doweit-Database_owner:wcYSDEX91Bot@ep-spring-rice-a5vzqvbn.us-east-2.aws.neon.tech/Doweit-Database?sslmode=require");
export const db = drizzle(sql);
