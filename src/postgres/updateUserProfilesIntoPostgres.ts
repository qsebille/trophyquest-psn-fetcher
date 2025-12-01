import {Pool} from "pg";
import {PsnUser} from "../psn/models/psnUser.js";
import {buildPostgresInsertPlaceholders} from "./utils/buildPostgresInsertPlaceholders.js";

/**
 * Updates user profiles into the PostgreSQL database.
 * If a user profile with the same ID already exists, it updates the avatar_url.
 * If not, it inserts a new user profile.
 *
 * @param {Pool} pool - The PostgreSQL connection pool used for querying the database.
 * @param {PsnUser[]} users - An array of user profile objects to be inserted or updated in the database.
 * @return {Promise<any>} A promise resolving to the result of the database operation.
 */
export async function updateUserProfileIntoPostgres(
    pool: Pool,
    users: PsnUser[]
): Promise<any> {
    if (users.length === 0) {
        console.info("No user profiles to insert into postgres database.");
        return;
    }

    const values: string[] = [];
    const placeholders: string = users.map((
        user,
        idx
    ) => {
        const currentValues = [user.id, user.profileName, user.avatarUrl ?? ""];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await pool.query(`
        INSERT INTO psn.user_profile (id, name, avatar_url)
        VALUES
            ${placeholders} ON CONFLICT (id)
        DO
        UPDATE SET avatar_url=EXCLUDED.avatar_url
    `, values);

    const nbUpdated = insert.rowCount;
    console.info(`Updated ${nbUpdated} users into postgres database`);
}