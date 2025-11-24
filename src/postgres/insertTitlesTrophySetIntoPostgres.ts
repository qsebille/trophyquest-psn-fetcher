import {Pool} from "pg";
import {buildPostgresInsertPlaceholders} from "./utils/buildPostgresInsertPlaceholders.js";
import {PsnTitleTrophySet} from "../psn/models/psnTitleTrophySet.js";

/**
 * Inserts a list of title-trophy-set links into a PostgreSQL database.
 * Ensures that duplicate entries (based on title_id and trophy_set_id) are ignored.
 *
 * @param {Pool} pool - The PostgreSQL connection pool used to execute the query.
 * @param {PsnTitleTrophySet[]} psnTitleTrophySets - An array of title-trophy-set links to be inserted.
 * @return {Promise<any>} A promise that resolves when the operation is completed.
 *                        It contains the result of the query execution, including the row count of inserted entries.
 */
export async function insertTitlesTrophySetIntoPostgres(pool: Pool, psnTitleTrophySets: PsnTitleTrophySet[]): Promise<any> {
    if (psnTitleTrophySets.length === 0) {
        console.info("No title-trophy-set links to insert into postgres database.");
        return;
    }

    const values: string[] = [];
    const placeholders: string = psnTitleTrophySets.map((link, idx) => {
        const currentValues = [link.titleId, link.trophySetId];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await pool.query(`
        INSERT INTO psn.title_trophy_set (title_id, trophy_set_id)
        VALUES
            ${placeholders} ON CONFLICT (title_id,trophy_set_id)
        DO NOTHING
    `, values);

    const nbInserted = insert.rowCount;
    const nbIgnored = psnTitleTrophySets.length - (insert.rowCount ?? 0);
    console.info(`Inserted ${nbInserted} titles-trophy-sets-links into postgres database ${nbIgnored > 0 ? `(${nbIgnored} ignored)` : ''}`);
}