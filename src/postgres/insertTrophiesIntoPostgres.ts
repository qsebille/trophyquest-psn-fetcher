import {Pool} from "pg";
import {PsnTrophy} from "../psn/models/psnTrophy.js";
import {buildPostgresInsertPlaceholders} from "./utils/buildPostgresInsertPlaceholders.js";

/**
 * Inserts a list of trophies into a Postgres database using batch processing.
 * Trophies that already exist (based on the `id` field) are ignored during the insertion.
 *
 * @param {Pool} pool - The database connection pool used to execute queries against the Postgres database.
 * @param {PsnTrophy[]} trophies - The array of trophies to insert into the database. Each trophy object must adhere to the PsnTrophy structure.
 * @return {Promise<any>} A promise that resolves when the trophies have been successfully inserted into the database
 * or when there are no trophies to insert.
 */
export async function insertTrophiesIntoPostgres(pool: Pool, trophies: PsnTrophy[]): Promise<any> {
    if (trophies.length === 0) {
        console.info("No trophies to insert into postgres database.");
        return;
    }

    const batchSize: number = trophies.length > 1000 ? 1000 : trophies.length;
    let nbIgnored: number = 0;
    let nbInserted: number = 0;

    for (let i = 0; i < trophies.length; i += batchSize) {
        const batch = trophies.slice(i, i + batchSize);
        const values: string[] = [];
        const placeholders: string = batch.map((t, idx) => {
            const currentValues: string[] = [
                t.id,
                t.trophySetId,
                t.rank.toString(),
                t.title,
                t.detail,
                t.isHidden.toString(),
                t.trophyType,
                t.iconUrl,
                t.groupId,
            ];
            values.push(...currentValues);
            return buildPostgresInsertPlaceholders(currentValues, idx);
        }).join(',');

        const insert = await pool.query(`
            INSERT INTO psn.trophy (id, trophy_set_id, rank, title, detail, is_hidden, trophy_type, icon_url,
                                    game_group_id)
            VALUES
                ${placeholders} ON CONFLICT (id)
            DO NOTHING
        `, values);

        nbInserted += insert.rowCount ?? 0;
        nbIgnored += (batch.length - (insert.rowCount ?? 0));
    }

    console.info(`Inserted ${nbInserted} trophies into postgres database ${nbIgnored > 0 ? `(${nbIgnored} ignored)` : ''}`);
}