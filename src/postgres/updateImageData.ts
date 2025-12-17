import {Pool, PoolClient} from "pg";
import {InsertQueryResult} from "./models/insertQueryResult.js";
import {GameImageData, updateGameMissingAwsImages} from "./queries/images/gameMissingImages.js";
import {CollectionImageData, updateCollectionMissingAwsImages} from "./queries/images/collectionMissingImages.js";
import {TrophyImageData, updateTrophyMissingAwsImages} from "./queries/images/trophyMissingImages.js";
import {PlayerImageData, updatePlayerMissingAwsImages} from "./queries/images/playerMissingImages.js";


export async function updateImageData(
    pool: Pool,
    playerImageData: PlayerImageData[],
    gameImageData: GameImageData[],
    collectionImageData: CollectionImageData[],
    trophyImageData: TrophyImageData[],
): Promise<void> {
    const client: PoolClient = await pool.connect();
    try {
        console.info("Updating image data in postgres...")
        await client.query('BEGIN');
        const playerResult: InsertQueryResult = await updatePlayerMissingAwsImages(playerImageData, pool);
        const gameResult: InsertQueryResult = await updateGameMissingAwsImages(gameImageData, pool);
        const collectionResult: InsertQueryResult = await updateCollectionMissingAwsImages(collectionImageData, pool);
        const trophyResult: InsertQueryResult = await updateTrophyMissingAwsImages(trophyImageData, pool);
        await client.query('COMMIT');

        console.info("Update of image data in postgres Success")
        console.info(`Postgres: Updated ${playerResult.rowsInserted} images in app.player table ${playerResult.rowsIgnored > 0 ? `(${playerResult.rowsIgnored} ignored)` : ''}`);
        console.info(`Postgres: Updated ${gameResult.rowsInserted} images into app.game table ${gameResult.rowsIgnored > 0 ? `(${gameResult.rowsIgnored} ignored)` : ''}`);
        console.info(`Postgres: Updated ${collectionResult.rowsInserted} images into app.trophy_collection table ${collectionResult.rowsIgnored > 0 ? `(${collectionResult.rowsIgnored} ignored)` : ''}`);
        console.info(`Postgres: Updated ${trophyResult.rowsInserted} images into app.trophy table ${trophyResult.rowsIgnored > 0 ? `(${trophyResult.rowsIgnored} ignored)` : ''}`);
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}