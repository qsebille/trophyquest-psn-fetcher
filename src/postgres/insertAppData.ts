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
        await client.query('BEGIN');
        const playerResponse: InsertQueryResult = await upsertAppPlayers(client, data.players);
        const gameResponse: InsertQueryResult = await insertAppGame(client, data.games);
        const collectionResponse: InsertQueryResult = await insertAppTrophyCollection(client, data.trophyCollections);
        const trophyResponse: InsertQueryResult = await insertAppTrophy(client, data.trophies);
        const playedGameResponse: InsertQueryResult = await insertAppPlayedGame(client, data.playedGames);
        const playedTrophyCollectionResponse: InsertQueryResult = await insertAppPlayedTrophyCollection(client, data.playedTrophyCollections);
        const earnedTrophyResponse: InsertQueryResult = await insertAppEarnedTrophy(client, data.earnedTrophies);
        await client.query('COMMIT');

        console.info(`[POSTGRES-APP] Upserted ${playerResponse.rowsInserted} players into postgres database`);
        console.info(`[POSTGRES-APP] Inserted ${gameResponse.rowsInserted} games into postgres database ${gameResponse.rowsIgnored > 0 ? `(${gameResponse.rowsIgnored} ignored)` : ''}`);
        console.info(`[POSTGRES-APP] Inserted ${collectionResponse.rowsInserted} trophy collections into postgres database ${collectionResponse.rowsIgnored > 0 ? `(${collectionResponse.rowsIgnored} ignored)` : ''}`);
        console.info(`[POSTGRES-APP] Inserted ${trophyResponse.rowsInserted} trophies into postgres database ${trophyResponse.rowsIgnored > 0 ? `(${trophyResponse.rowsIgnored} ignored)` : ''}`);
        console.info(`[POSTGRES-APP] Inserted ${playedGameResponse.rowsInserted} played games into postgres database`);
        console.info(`[POSTGRES-APP] Inserted ${playedTrophyCollectionResponse.rowsInserted} played trophy collections into postgres database ${playedTrophyCollectionResponse.rowsIgnored > 0 ? `(${playedTrophyCollectionResponse.rowsIgnored} ignored)` : ''}`);
        console.info(`[POSTGRES-APP] Inserted ${earnedTrophyResponse.rowsInserted} earned trophies into postgres database ${earnedTrophyResponse.rowsIgnored > 0 ? `(${earnedTrophyResponse.rowsIgnored} ignored)` : ''}`);
        console.info('[POSTGRES-APP] Success');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}