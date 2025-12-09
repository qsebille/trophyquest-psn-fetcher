import {buildPostgresPool} from "./postgres/utils/buildPostgresPool.js";
import {Pool} from "pg";
import {GameImageData, getGameMissingAwsImages} from "./postgres/queries/images/gameMissingImages.js";
import {uploadGameImages} from "./aws/uploadGameImages.js";
import {updateImageData} from "./postgres/updateImageData.js";
import {CollectionImageData, getCollectionMissingAwsImages} from "./postgres/queries/images/collectionMissingImages.js";
import {uploadCollectionImages} from "./aws/uploadCollectionImages.js";
import {getTrophyMissingAwsImages, TrophyImageData} from "./postgres/queries/images/trophyMissingImages.js";
import {uploadTrophyImages} from "./aws/uploadTrophyImages.js";
import {getMandatoryParam} from "./config/getMandatoryParam.js";


async function runImageUploader(): Promise<void> {
    const startTime = Date.now();
    console.info("[IMAGE-UPLOADER] Start");

    const pool: Pool = buildPostgresPool();
    const limitPerEntity: number = Number(getMandatoryParam('LIMIT_PER_ENTITY'));
    const concurrency: number = Number(getMandatoryParam('CONCURRENCY'));

    try {
        const gameMissingImages: GameImageData[] = await getGameMissingAwsImages(pool, limitPerEntity);
        const gameUploadedImages: GameImageData[] = await uploadGameImages(gameMissingImages, concurrency);
        console.info(`[IMAGE-UPLOADER] Uploaded ${gameUploadedImages.length} game images`);

        const collectionMissingImages: CollectionImageData[] = await getCollectionMissingAwsImages(pool, limitPerEntity);
        const collectionUploadedImages: CollectionImageData[] = await uploadCollectionImages(collectionMissingImages, concurrency);
        console.info(`[IMAGE-UPLOADER] Uploaded ${collectionUploadedImages.length} collection images`);

        const trophyMissingImages: TrophyImageData[] = await getTrophyMissingAwsImages(pool, limitPerEntity);
        const trophyUploadedImages: TrophyImageData[] = await uploadTrophyImages(trophyMissingImages, concurrency);
        console.info(`[IMAGE-UPLOADER] Uploaded ${trophyUploadedImages.length} trophy images`);

        await updateImageData(pool, gameUploadedImages, collectionUploadedImages, trophyUploadedImages);
        console.info("[IMAGE-UPLOADER] Success");
    } finally {
        const durationSeconds = (Date.now() - startTime) / 1000;
        console.info(`[IMAGE-UPLOADER] Total processing time: ${durationSeconds.toFixed(2)} s`);
        await pool.end();
    }
}

export const handler = async (
    event: any = {},
    _context: any = {}
): Promise<void> => {
    if (event.limitPerEntity) {
        process.env.LIMIT_PER_ENTITY = event.limitPerEntity;
    }
    if (event.concurrency) {
        process.env.CONCURRENCY = event.concurrency;
    }

    await runImageUploader();
};

if (!process.env.LAMBDA_TASK_ROOT) {
    runImageUploader().catch((e) => {
        console.error(e);
        process.exitCode = 1;
    });
}
