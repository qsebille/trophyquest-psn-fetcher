import {buildPostgresPool} from "./postgres/utils/buildPostgresPool.js";
import {Pool} from "pg";
import {getTrophySetMissingAwsImages, TrophySetImageData} from "./postgres/queries/images/gameMissingImages.js";
import {uploadGameImages} from "./aws/uploadGameImages.js";
import {updateImageData} from "./postgres/updateImageData.js";
import {getTrophyMissingAwsImages, TrophyImageData} from "./postgres/queries/images/trophyMissingImages.js";
import {uploadTrophyImages} from "./aws/uploadTrophyImages.js";
import {getMandatoryParam} from "./config/getMandatoryParam.js";
import {getPlayerMissingAwsImages, PlayerImageData} from "./postgres/queries/images/playerMissingImages.js";
import {uploadPlayerImages} from "./aws/uploadPlayerImages.js";


async function runImageUploader(): Promise<void> {
    const startTime = Date.now();
    console.info("Start Image Upload Function");

    const pool: Pool = buildPostgresPool();
    const limitPerEntity: number = Number(getMandatoryParam('LIMIT_PER_ENTITY'));
    const concurrency: number = Number(getMandatoryParam('CONCURRENCY'));

    try {
        const playerMissingImages: PlayerImageData[] = await getPlayerMissingAwsImages(pool, limitPerEntity);
        const playerUploadedImages: PlayerImageData[] = await uploadPlayerImages(playerMissingImages, concurrency);
        console.info(`Uploaded ${playerUploadedImages.length} player images`);

        const gameMissingImages: TrophySetImageData[] = await getTrophySetMissingAwsImages(pool, limitPerEntity);
        const gameUploadedImages: TrophySetImageData[] = await uploadGameImages(gameMissingImages, concurrency);
        console.info(`Uploaded ${gameUploadedImages.length} game images`);

        const trophyMissingImages: TrophyImageData[] = await getTrophyMissingAwsImages(pool, limitPerEntity);
        const trophyUploadedImages: TrophyImageData[] = await uploadTrophyImages(trophyMissingImages, concurrency);
        console.info(`Uploaded ${trophyUploadedImages.length} trophy images`);

        await updateImageData(pool, playerUploadedImages, gameUploadedImages, trophyUploadedImages);
        console.info("Image Upload : Success");
    } finally {
        const durationSeconds = (Date.now() - startTime) / 1000;
        console.info(`Total processing time: ${durationSeconds.toFixed(2)} s`);
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
