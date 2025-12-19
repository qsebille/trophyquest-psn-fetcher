import {PoolClient} from "pg";
import {PsnTrophy} from "../../../psn/models/psnTrophy.js";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";


/**
 * Inserts a batch of PlayStation Network (PSN) trophy data into the database.
 * This method processes trophies in batches to handle large data efficiently.
 * Duplicate trophies based on their unique ID will be ignored.
 *
 * @param {PoolClient} client - The database client to perform the insertion operation.
 * @param {PsnTrophy[]} trophies - An array of PSN trophies to be inserted into the database.
 * @return {Promise<InsertQueryResult>} - A promise that resolves with the result of the insertion operation,
 * containing the number of rows inserted and ignored.
 */
export async function insertPsnTrophies(
    client: PoolClient,
    trophies: PsnTrophy[]
): Promise<InsertQueryResult> {
    if (trophies.length === 0) {
        console.warn("No data to update in psn.trophy table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const batchSize: number = trophies.length > 1000 ? 1000 : trophies.length;
    let nbIgnored: number = 0;
    let nbInserted: number = 0;

    for (let i = 0; i < trophies.length; i += batchSize) {
        const batch = trophies.slice(i, i + batchSize);
        const values: string[] = [];
        const placeholders: string = batch.map((
            t,
            idx
        ) => {
            const currentValues: string[] = [
                t.id,
                t.titleId,
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

        const insert = await client.query(`
            INSERT INTO psn.trophy (id, title_id, rank, title, detail, is_hidden, trophy_type, icon_url, game_group_id)
            VALUES
                ${placeholders} ON CONFLICT (id)
            DO NOTHING
        `, values);

        nbInserted += insert.rowCount ?? 0;
        nbIgnored += (batch.length - (insert.rowCount ?? 0));
    }

    return {rowsInserted: nbInserted, rowsIgnored: nbIgnored};
}