import {Pool} from "pg";
import {AppPlayer} from "../../../app/models/appPlayer.js";


export async function getAllPsnUsers(pool: Pool): Promise<AppPlayer[]> {
    const userQueryResult = await pool.query("SELECT * FROM psn.user_profile");

    return userQueryResult.rows;
}