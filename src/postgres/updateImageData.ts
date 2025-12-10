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
        await client.query('BEGIN');

        const playerResult: InsertQueryResult = await updatePlayerMissingAwsImages(playerImageData, pool);
        const gameResult: InsertQueryResult = await updateGameMissingAwsImages(gameImageData, pool);
        const collectionResult: InsertQueryResult = await updateCollectionMissingAwsImages(collectionImageData, pool);
        const trophyResult: InsertQueryResult = await updateTrophyMissingAwsImages(trophyImageData, pool);

        console.info(`[IMAGE-POSTGRES] Updated ${playerResult.rowsInserted} player images into postgres database ${playerResult.rowsIgnored > 0 ? `(${playerResult.rowsIgnored} ignored)` : ''}`);
        console.info(`[IMAGE-POSTGRES] Updated ${gameResult.rowsInserted} game images into postgres database ${gameResult.rowsIgnored > 0 ? `(${gameResult.rowsIgnored} ignored)` : ''}`);
        console.info(`[IMAGE-POSTGRES] Updated ${collectionResult.rowsInserted} collection images into postgres database ${collectionResult.rowsIgnored > 0 ? `(${collectionResult.rowsIgnored} ignored)` : ''}`);
        console.info(`[IMAGE-POSTGRES] Updated ${trophyResult.rowsInserted} trophy images into postgres database ${trophyResult.rowsIgnored > 0 ? `(${trophyResult.rowsIgnored} ignored)` : ''}`);
        console.info('[IMAGE-POSTGRES] Success');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}