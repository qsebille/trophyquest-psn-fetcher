import {PoolClient} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {PsnTitleTrophySet} from "../../../psn/models/psnTitleTrophySet.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";


/**
 * Inserts a batch of PlayStation Network (PSN) title-to-trophy-set mappings into the database.
 * If a mapping already exists, it will be ignored.
 *
 * @param {PoolClient} client - The database client used to execute the query.
 * @param {PsnTitleTrophySet[]} psnTitleTrophySets - An array of objects representing the title-to-trophy-set mappings to insert.
 * Each object should contain `titleId` and `trophySetId` properties.
 * @return {Promise<InsertQueryResult>} An object containing the number of rows inserted (`rowsInserted`) and the number of rows ignored (`rowsIgnored`).
 */
export async function insertPsnTitlesTrophySet(
    client: PoolClient,
    psnTitleTrophySets: PsnTitleTrophySet[]
): Promise<InsertQueryResult> {
    if (psnTitleTrophySets.length === 0) {
        console.warn("No data to update in psn.title_trophy_set table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = psnTitleTrophySets.map((
        link,
        idx
    ) => {
        const currentValues = [link.titleId, link.trophySetId];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await client.query(`
        INSERT INTO psn.title_trophy_set (title_id, trophy_set_id)
        VALUES
            ${placeholders} ON CONFLICT (title_id,trophy_set_id)
        DO NOTHING
    `, values);

    const nbInserted = insert.rowCount ?? 0;
    const nbIgnored = psnTitleTrophySets.length - nbInserted;
    return {
        rowsInserted: nbInserted,
        rowsIgnored: nbIgnored,
    }
}