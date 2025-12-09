import {Pool, PoolClient} from "pg";
import {InsertQueryResult} from "./models/insertQueryResult.js";
import {GameImageData, updateGameMissingAwsImages} from "./queries/images/gameMissingImages.js";
import {CollectionImageData, updateCollectionMissingAwsImages} from "./queries/images/collectionMissingImages.js";
import {TrophyImageData, updateTrophyMissingAwsImages} from "./queries/images/trophyMissingImages.js";


export async function updateImageData(
    pool: Pool,
    gameImageData: GameImageData[],
    collectionImageData: CollectionImageData[],
    trophyImageData: TrophyImageData[],
): Promise<void> {
    const client: PoolClient = await pool.connect();
    try {
        await client.query('BEGIN');

        const gameResult: InsertQueryResult = await updateGameMissingAwsImages(gameImageData, pool);
        const collectionResult: InsertQueryResult = await updateCollectionMissingAwsImages(collectionImageData, pool);
        const trophyResult: InsertQueryResult = await updateTrophyMissingAwsImages(trophyImageData, pool);

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