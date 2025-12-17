import {Pool, PoolClient} from "pg";
import {AppDataWrapper} from "../app/models/wrappers/appDataWrapper.js";
import {InsertQueryResult} from "./models/insertQueryResult.js";
import {upsertAppPlayers} from "./queries/app/upsertAppPlayers.js";
import {insertAppGame} from "./queries/app/insertAppGame.js";
import {insertAppTrophyCollection} from "./queries/app/insertAppTrophyCollection.js";
import {insertAppTrophy} from "./queries/app/insertAppTrophy.js";
import {insertAppPlayedGame} from "./queries/app/insertAppPlayedGame.js";
import {insertAppEarnedTrophy} from "./queries/app/insertAppEarnedTrophy.js";
import {insertAppPlayedTrophyCollection} from "./queries/app/insertAppPlayedTrophyCollection.js";

export async function insertAppData(
    pool: Pool,
    data: AppDataWrapper,
): Promise<void> {
    const client: PoolClient = await pool.connect();
    try {
        console.info("Inserting app data into postgres...")
        await client.query('BEGIN');
        const playerResponse: InsertQueryResult = await upsertAppPlayers(client, data.players);
        const gameResponse: InsertQueryResult = await insertAppGame(client, data.games);
        const collectionResponse: InsertQueryResult = await insertAppTrophyCollection(client, data.trophyCollections);
        const trophyResponse: InsertQueryResult = await insertAppTrophy(client, data.trophies);
        const playedGameResponse: InsertQueryResult = await insertAppPlayedGame(client, data.playedGames);
        const playedTrophyCollectionResponse: InsertQueryResult = await insertAppPlayedTrophyCollection(client, data.playedTrophyCollections);
        const earnedTrophyResponse: InsertQueryResult = await insertAppEarnedTrophy(client, data.earnedTrophies);
        await client.query('COMMIT');

        console.info("Insertion of app data into postgres: Success")
        console.info(`Postgres: Upserted ${playerResponse.rowsInserted} lines into app.player table`);
        console.info(`Postgres: Inserted ${gameResponse.rowsInserted} lines into app.game table ${gameResponse.rowsIgnored > 0 ? `(${gameResponse.rowsIgnored} ignored)` : ''}`);
        console.info(`Postgres: Inserted ${collectionResponse.rowsInserted} lines into app.trophy_collection table ${collectionResponse.rowsIgnored > 0 ? `(${collectionResponse.rowsIgnored} ignored)` : ''}`);
        console.info(`Postgres: Inserted ${trophyResponse.rowsInserted} lines into app.trophy table ${trophyResponse.rowsIgnored > 0 ? `(${trophyResponse.rowsIgnored} ignored)` : ''}`);
        console.info(`Postgres: Inserted ${playedGameResponse.rowsInserted} lines into app.played_game table`);
        console.info(`Postgres: Inserted ${playedTrophyCollectionResponse.rowsInserted} lines into app.played_trophy_collection table ${playedTrophyCollectionResponse.rowsIgnored > 0 ? `(${playedTrophyCollectionResponse.rowsIgnored} ignored)` : ''}`);
        console.info(`Postgres: Inserted ${earnedTrophyResponse.rowsInserted} lines into app.earned_trophy table ${earnedTrophyResponse.rowsIgnored > 0 ? `(${earnedTrophyResponse.rowsIgnored} ignored)` : ''}`);
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}