import {Pool, PoolClient} from "pg";
import {AppDataWrapper} from "../app/models/wrappers/appDataWrapper.js";
import {InsertQueryResult} from "./models/insertQueryResult.js";
import {insertAppPlayers} from "./queries/app/insertAppPlayers.js";
import {insertAppTrophySet} from "./queries/app/insertAppTrophySet.js";
import {insertAppTrophy} from "./queries/app/insertAppTrophy.js";
import {insertAppPlayedTrophySet} from "./queries/app/insertAppPlayedTrophySet.js";
import {insertAppEarnedTrophy} from "./queries/app/insertAppEarnedTrophy.js";

export async function insertAppData(
    pool: Pool,
    data: AppDataWrapper,
): Promise<void> {
    const client: PoolClient = await pool.connect();
    try {
        console.info("Inserting app data into postgres...")
        await client.query('BEGIN');
        const playerResponse: InsertQueryResult = await insertAppPlayers(client, data.players);
        const gameResponse: InsertQueryResult = await insertAppTrophySet(client, data.games);
        const trophyResponse: InsertQueryResult = await insertAppTrophy(client, data.trophies);
        const playedGameResponse: InsertQueryResult = await insertAppPlayedTrophySet(client, data.playedGames);
        const earnedTrophyResponse: InsertQueryResult = await insertAppEarnedTrophy(client, data.earnedTrophies);
        await client.query('COMMIT');

        console.info("Insertion of app data into postgres: Success")
        console.info(`Postgres: Inserted ${playerResponse.rowsInserted} lines into app.player table`);
        console.info(`Postgres: Inserted ${gameResponse.rowsInserted} lines into app.trophy_set table ${gameResponse.rowsIgnored > 0 ? `(${gameResponse.rowsIgnored} ignored)` : ''}`);
        console.info(`Postgres: Inserted ${trophyResponse.rowsInserted} lines into app.trophy table ${trophyResponse.rowsIgnored > 0 ? `(${trophyResponse.rowsIgnored} ignored)` : ''}`);
        console.info(`Postgres: Inserted ${playedGameResponse.rowsInserted} lines into app.played_trophy_set table`);
        console.info(`Postgres: Inserted ${earnedTrophyResponse.rowsInserted} lines into app.earned_trophy table ${earnedTrophyResponse.rowsIgnored > 0 ? `(${earnedTrophyResponse.rowsIgnored} ignored)` : ''}`);
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}