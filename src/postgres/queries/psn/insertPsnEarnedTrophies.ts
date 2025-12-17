import {PoolClient} from "pg";
import {PsnEarnedTrophy} from "../../../psn/models/psnEarnedTrophy.js";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";


/**
 * Inserts earned PlayStation trophies into the database. If a trophy already exists for a user, it will be ignored.
 *
 * @param {PoolClient} client - The PostgreSQL client used to execute the queries.
 * @param {PsnEarnedTrophy[]} earnedTrophies - An array of earned trophies data to be inserted into the database.
 * @return {Promise<InsertQueryResult>} A promise resolving to an object containing the number of rows inserted and ignored.
 */
export async function insertPsnEarnedTrophies(
    client: PoolClient,
    earnedTrophies: PsnEarnedTrophy[]
): Promise<InsertQueryResult> {

    if (earnedTrophies.length === 0) {
        console.warn("No data to update in psn.user_earned_trophy table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const batchSize: number = earnedTrophies.length > 1000 ? 1000 : earnedTrophies.length;
    let nbIgnored: number = 0;
    let nbInserted: number = 0;

    for (let i = 0; i < earnedTrophies.length; i += batchSize) {
        const batch = earnedTrophies.slice(i, i + batchSize);
        const values: string[] = [];
        const placeholders: string = batch.map((
            trophy,
            idx
        ) => {
            const currentValues: string[] = [
                trophy.trophyId,
                trophy.userId,
                trophy.earnedDateTime,
            ];
            values.push(...currentValues);
            return buildPostgresInsertPlaceholders(currentValues, idx);
        }).join(',');

        const insert = await client.query(`
            INSERT INTO psn.user_earned_trophy (trophy_id, user_id, earned_at)
            VALUES
                ${placeholders} ON CONFLICT (trophy_id,user_id)
            DO NOTHING
        `, values);

        nbInserted += insert.rowCount ?? 0;
        nbIgnored += (batch.length - (insert.rowCount ?? 0));
    }

    return {rowsInserted: nbInserted, rowsIgnored: nbIgnored};
}