import {buildPostgresPool} from "./postgres/utils/buildPostgresPool.js";
import {Pool} from "pg";
import {getPsnAuthTokens, PsnAuthTokens} from "./auth/psnAuthTokens.js";
import {PsnDataWrapper} from "./psn/models/wrappers/psnDataWrapper.js";
import {fetchPsnUserData} from "./psn/fetchPsnUserData.js";
import {insertPsnData} from "./postgres/insertPsnData.js";
import {AppDataWrapper} from "./app/models/wrappers/appDataWrapper.js";
import {computeAppData} from "./app/computeAppData.js";
import {insertAppData} from "./postgres/insertAppData.js";
import {getMandatoryParam} from "./config/getMandatoryParam.js";

/**
 * Main method that coordinates the fetching, processing, and storing of PlayStation Network (PSN) user data, including titles, trophy sets, trophies, and earned trophies.
 * It authenticates the user, retrieves data from the PSN API, and inserts the processed data into a PostgreSQL database.
 *
 * @return {Promise<void>} A promise that resolves when the entire process is completed successfully, or rejects if any errors occur during execution.
 */
async function runFetcher(): Promise<void> {
    const startTime = Date.now();
    console.info("Start PSN Fetcher function");

    const npsso: string = getMandatoryParam('NPSSO');
    const profileName: string = getMandatoryParam('PROFILE_NAME');
    const pool: Pool = buildPostgresPool();
    console.info(`Fetching PSN data for profile ${profileName}`);

    try {
        const psnAuthTokens: PsnAuthTokens = await getPsnAuthTokens(npsso);
        const psnData: PsnDataWrapper = await fetchPsnUserData(psnAuthTokens, profileName);
        const appData: AppDataWrapper = computeAppData(psnData);
        await insertPsnData(pool, psnData);
        await insertAppData(pool, appData);
        console.info("PSN Fetcher : Success");
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
    if (event.profileName) {
        process.env.PROFILE_NAME = event.profileName;
    }

    await runFetcher();
};

if (!process.env.LAMBDA_TASK_ROOT) {
    runFetcher().catch((e) => {
        console.error(e);
        process.exitCode = 1;
    });
}
