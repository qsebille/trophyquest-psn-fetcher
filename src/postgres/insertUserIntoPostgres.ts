import {Pool} from "pg";
import {PsnUser} from "../psn/models/psnUser.js";

/**
 * Inserts a user record into the PostgreSQL `psn.user_profile` table. If the user already exists,
 * the operation is ignored and no changes are made to the database.
 *
 * @param {Pool} pool - The PostgreSQL connection pool used to perform the database operation.
 * @param {PsnUser} user - The user data to be inserted, containing properties `id`, `profileName`, and `avatarUrl`.
 * @return {Promise<any>} A promise that resolves with the result of the query execution.
 */
export async function insertUserIntoPostgres(pool: Pool, user: PsnUser): Promise<any> {
    const insert = await pool.query(
        `
            INSERT INTO psn.user_profile (id, name, avatar_url)
            VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING
        `,
        [user.id, user.profileName, user.avatarUrl]
    );

    if (insert.rowCount === 0) {
        console.info(`User ${user.profileName} already in postgres database`);
    } else {
        console.info(`Inserted user ${user.profileName} into postgres database`);
    }
}