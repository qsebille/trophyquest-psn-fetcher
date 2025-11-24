import {Pool} from "pg";
import {PsnEarnedTrophy} from "../psn/models/psnEarnedTrophy.js";
import {buildPostgresInsertPlaceholders} from "./utils/buildPostgresInsertPlaceholders.js";

/**
 * Inserts a list of earned trophies into a PostgreSQL database. Batches the inserts if the list size exceeds a specified limit.
 * If a trophy already exists for the given user, the insertion is ignored.
 *
 * @param {Pool} pool - The PostgreSQL connection pool instance used to execute the queries.
 * @param {PsnEarnedTrophy[]} earnedTrophies - An array of earned trophies to be inserted. Each trophy contains details such as `trophyId`, `userId`, and `earnedDateTime`.
 * @return {Promise<any>} A Promise that resolves when the insertion process is complete, providing query result details or undefined if no trophies were inserted.
 */
export async function insertEarnedTrophiesIntoPostgres(pool: Pool, earnedTrophies: PsnEarnedTrophy[]): Promise<any> {
    if (earnedTrophies.length === 0) {
        console.info("No earned trophies to insert into postgres database.");
        return;
    }

    const batchSize: number = earnedTrophies.length > 1000 ? 1000 : earnedTrophies.length;
    let nbIgnored: number = 0;
    let nbInserted: number = 0;

    for (let i = 0; i < earnedTrophies.length; i += batchSize) {
        const batch = earnedTrophies.slice(i, i + batchSize);
        const values: string[] = [];
        const placeholders: string = batch.map((trophy, idx) => {
            const currentValues: string[] = [
                trophy.trophyId,
                trophy.userId,
                trophy.earnedDateTime,
            ];
            values.push(...currentValues);
            return buildPostgresInsertPlaceholders(currentValues, idx);
        }).join(',');

        const insert = await pool.query(`
            INSERT INTO psn.user_earned_trophy (trophy_id, user_id, earned_at)
            VALUES
                ${placeholders} ON CONFLICT (trophy_id,user_id)
            DO NOTHING
        `, values);

        nbInserted += insert.rowCount ?? 0;
        nbIgnored += (batch.length - (insert.rowCount ?? 0));
    }

    console.info(`Inserted ${nbInserted} earned trophies into postgres database ${nbIgnored > 0 ? `(${nbIgnored} ignored)` : ''}`);
}