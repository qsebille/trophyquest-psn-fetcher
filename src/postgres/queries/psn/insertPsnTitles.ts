import {PoolClient} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {PsnTitle} from "../../../psn/models/psnTitle.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";


/**
 * Inserts a list of PlayStation titles into the database. Skips any titles that conflict based on their ID.
 *
 * @param {PoolClient} client - PostgreSQL client connection to be used for the operation.
 * @param {PsnTitle[]} titles - Array of PlayStation titles to be inserted into the database.
 * @return {Promise<InsertQueryResult>} - An object containing the count of rows inserted and rows ignored due to conflicts.
 */
export async function insertPsnTitles(
    client: PoolClient,
    titles: PsnTitle[]
): Promise<InsertQueryResult> {
    if (titles.length === 0) {
        console.warn("No data to update in psn.title table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = titles.map((
        t,
        idx
    ) => {
        const currentValues = [t.id, t.name, t.category, t.imageUrl];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await client.query(`
        INSERT INTO psn.title (id, name, category, image_url)
        VALUES
            ${placeholders} ON CONFLICT (id)
        DO NOTHING
    `, values);

    const nbInserted = insert.rowCount ?? 0;
    const nbIgnored = titles.length - nbInserted;
    return {
        rowsInserted: nbInserted,
        rowsIgnored: nbIgnored,
    }
}