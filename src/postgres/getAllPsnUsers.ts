import {Pool} from "pg";
import {PostgresUserProfile} from "./models/postgresUserProfile.js";


export async function getAllPsnUsers(pool: Pool): Promise<PostgresUserProfile[]> {
    const userQueryResult = await pool.query("SELECT * FROM psn.user_profile");

    return userQueryResult.rows;
}