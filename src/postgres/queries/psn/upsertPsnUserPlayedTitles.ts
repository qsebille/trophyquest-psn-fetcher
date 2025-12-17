import {PoolClient} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {PsnPlayedTitle} from "../../../psn/models/psnPlayedTitle.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";


/**
 * Inserts or updates a list of PlayStation user played titles into the database.
 * If a title already exists for a user, it updates the `last_played_at` field.
 * If it does not exist, it inserts a new record.
 *
 * @param {PoolClient} client - The database client used to execute the query.
 * @param {PsnPlayedTitle[]} playedTitles - An array of user played title objects, each containing `userId`, `titleId`, and `lastPlayedDateTime`.
 * @return {Promise<InsertQueryResult>} A promise resolving to an object containing the number of rows inserted and ignored.
 */
export async function upsertPsnUserPlayedTitles(
    client: PoolClient,
    playedTitles: PsnPlayedTitle[]
): Promise<InsertQueryResult> {
    if (playedTitles.length === 0) {
        console.warn("No data to update in psn.user_played_title table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = playedTitles.map((
        playedTitle,
        idx
    ) => {
        const currentValues = [playedTitle.userId, playedTitle.titleId, playedTitle.lastPlayedDateTime];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await client.query(`
        INSERT INTO psn.user_played_title (user_id, title_id, last_played_at)
        VALUES
            ${placeholders} ON CONFLICT (user_id,title_id)
        DO
        UPDATE SET last_played_at=EXCLUDED.last_played_at
    `, values);

    return {
        rowsInserted: insert.rowCount ?? 0,
        rowsIgnored: 0,
    }
}