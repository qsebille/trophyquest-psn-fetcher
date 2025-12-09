import {insertPsnTitles} from "./queries/psn/insertPsnTitles.js";
import {upsertPsnUserPlayedTitles} from "./queries/psn/upsertPsnUserPlayedTitles.js";
import {insertPsnTrophySets} from "./queries/psn/insertPsnTrophySets.js";
import {insertPsnTitlesTrophySet} from "./queries/psn/insertPsnTitlesTrophySet.js";
import {insertPsnTrophies} from "./queries/psn/insertPsnTrophies.js";
import {insertPsnEarnedTrophies} from "./queries/psn/insertPsnEarnedTrophies.js";
import {Pool, PoolClient} from "pg";
import {upsertPsnUserProfiles} from "./queries/psn/upsertPsnUserProfiles.js";
import {PsnDataWrapper} from "../psn/models/wrappers/psnDataWrapper.js";
import {InsertQueryResult} from "./models/insertQueryResult.js";

/**
 * Inserts PlayStation Network (PSN) data into the database. The method performs a transactional
 * operation to upsert user profiles, and to insert titles, played titles, trophy sets, title-trophy
 * set links, trophies, and earned trophies into the corresponding database tables.
 *
 * @async
 * @param {Pool} pool - The database connection pool used to perform the database operations.
 * @param {PsnDataWrapper} data - The object containing structured PSN data including users, titles,
 * played titles, trophy sets, title-trophy set relationships, trophies, and earned trophies.
 * @return {Promise<void>} A promise that resolves once all operations are completed successfully,
 * or rejects with an error if any operation fails during the transaction.
 */
export async function insertPsnData(
    pool: Pool,
    data: PsnDataWrapper,
): Promise<void> {
    const client: PoolClient = await pool.connect();
    try {
        await client.query('BEGIN');
        const userResponse: InsertQueryResult = await upsertPsnUserProfiles(client, data.users);
        const titlesResponse: InsertQueryResult = await insertPsnTitles(client, data.titles);
        const playedTitlesResponse: InsertQueryResult = await upsertPsnUserPlayedTitles(client, data.playedTitles);
        const trophySetsResponse: InsertQueryResult = await insertPsnTrophySets(client, data.trophySets);
        const titlesTrophySetResponse: InsertQueryResult = await insertPsnTitlesTrophySet(client, data.titleTrophySets);
        const trophyResponse: InsertQueryResult = await insertPsnTrophies(client, data.trophies);
        const earnedTrophyResponse: InsertQueryResult = await insertPsnEarnedTrophies(client, data.earnedTrophies);
        await client.query('COMMIT');

        console.info(`[POSTGRES-PSN] Upserted ${userResponse.rowsInserted} users into postgres database`);
        console.info(`[POSTGRES-PSN] Inserted ${titlesResponse.rowsInserted} titles into postgres database ${titlesResponse.rowsIgnored > 0 ? `(${titlesResponse.rowsIgnored} ignored)` : ''}`);
        console.info(`[POSTGRES-PSN] Inserted ${playedTitlesResponse.rowsInserted} played titles into postgres database`);
        console.info(`[POSTGRES-PSN] Inserted ${trophySetsResponse.rowsInserted} trophy sets into postgres database ${trophySetsResponse.rowsIgnored > 0 ? `(${trophySetsResponse.rowsIgnored} ignored)` : ''}`);
        console.info(`[POSTGRES-PSN] Inserted ${titlesTrophySetResponse.rowsInserted} titles / trophy sets links into postgres database ${titlesTrophySetResponse.rowsIgnored > 0 ? `(${titlesTrophySetResponse.rowsIgnored} ignored)` : ''}`);
        console.info(`[POSTGRES-PSN] Inserted ${trophyResponse.rowsInserted} trophies into postgres database ${trophyResponse.rowsIgnored > 0 ? `(${trophyResponse.rowsIgnored} ignored)` : ''}`);
        console.info(`[POSTGRES-PSN] Inserted ${earnedTrophyResponse.rowsInserted} earned trophies into postgres database ${earnedTrophyResponse.rowsIgnored > 0 ? `(${earnedTrophyResponse.rowsIgnored} ignored)` : ''}`);
        console.info('[POSTGRES-PSN] Success');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}