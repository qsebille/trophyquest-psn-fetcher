import {Pool} from "pg";
import {PsnUser} from "../psn/models/psnUser.js";
import {buildPostgresInsertPlaceholders} from "./utils/buildPostgresInsertPlaceholders.js";
import {PsnTitle} from "../psn/models/psnTitle.js";

/**
 * Inserts user titles into a PostgreSQL database. If a title already exists for the given user,
 * it updates the `last_played_at` field. Handles multiple titles in one operation.
 *
 * @param {Pool} pool - The database connection pool used to execute the query.
 * @param {PsnUser} psnUser - The user for which the titles are being inserted.
 * @param {PsnTitle[]} titles - An array of titles to insert or update in the database.
 * @return {Promise<any>} A promise that resolves when the insertion or update operation is complete.
 */
export async function insertUserTitlesIntoPostgres(pool: Pool, psnUser: PsnUser, titles: PsnTitle[]): Promise<any> {
    if (titles.length === 0) {
        console.info("No user titles to insert into postgres database.");
        return;
    }

    const values: string[] = [];
    const placeholders: string = titles.map((title, idx) => {
        const currentValues = [psnUser.id, title.id, title.lastPlayedDateTime];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await pool.query(`
        INSERT INTO psn.user_played_title (user_id, title_id, last_played_at)
        VALUES
            ${placeholders} ON CONFLICT (user_id,title_id)
        DO
        UPDATE SET last_played_at=EXCLUDED.last_played_at
    `, values);

    const nbInserted = insert.rowCount;
    const nbIgnored = titles.length - (insert.rowCount ?? 0);
    console.info(`Inserted ${nbInserted} user titles into postgres database ${nbIgnored > 0 ? `(${nbIgnored} ignored)` : ''}`);
}