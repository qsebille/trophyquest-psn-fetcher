import {Pool} from "pg";

export function buildPostgresPool(): Pool {
    let host: string;
    let port: number;
    let database: string;
    let user: string;
    let password: string;

    if (process.env.PGHOST === undefined) {
        console.error("PGHOST params must be provided")
        process.exit(1);
    } else {
        host = process.env.PGHOST;
    }

    if (process.env.PGPORT === undefined) {
        console.error("PGPORT params must be provided")
        process.exit(1);
    } else {
        port = Number(process.env.PGPORT);
    }

    if (process.env.PGDATABASE === undefined) {
        console.error("PGDATABASE params must be provided")
        process.exit(1);
    } else {
        database = process.env.PGDATABASE;
    }

    if (process.env.PGUSER === undefined) {
        console.error("PGUSER params must be provided")
        process.exit(1);
    } else {
        user = process.env.PGUSER;
    }

    if (process.env.PGPASSWORD === undefined) {
        console.error("PGPASSWORD params must be provided")
        process.exit(1);
    } else {
        password = process.env.PGPASSWORD;
    }

    return new Pool({
        host,
        port,
        database,
        user,
        password,
        ssl: process.env.PGSSL === "true" ? {rejectUnauthorized: false} : undefined,
    });
}