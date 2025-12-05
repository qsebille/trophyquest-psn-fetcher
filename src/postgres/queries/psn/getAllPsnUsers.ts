import {Pool} from "pg";
import {PsnUserProfilePostgres} from "../../models/psnUserProfilePostgres.js";


export async function getAllPsnUsers(pool: Pool): Promise<PsnUserProfilePostgres[]> {
    const userQueryResult = await pool.query("SELECT * FROM psn.user_profile");

    return userQueryResult.rows;
}