import {getParams, Params} from "./config/params.js";
import {buildPostgresPool} from "./postgres/utils/buildPostgresPool.js";
import {Pool} from "pg";
import {getPsnAuthTokens, PsnAuthTokens} from "./auth/psnAuthTokens.js";
import {PsnDataWrapper} from "./psn/models/wrappers/psnDataWrapper.js";
import {fetchPsnUserData} from "./psn/fetchPsnUserData.js";
import {insertPsnData} from "./postgres/insertPsnData.js";
import {AppDataWrapper} from "./app/models/wrappers/appDataWrapper.js";
import computeAppData from "./app/computeAppData.js";
import {insertAppData} from "./postgres/insertAppData.js";


/**
 * Main method that coordinates the fetching, processing, and storing of PlayStation Network (PSN) user data, including titles, trophy sets, trophies, and earned trophies.
 * It authenticates the user, retrieves data from the PSN API, and inserts the processed data into a PostgreSQL database.
 *
 * @return {Promise<void>} A promise that resolves when the entire process is completed successfully, or rejects if any errors occur during execution.
 */
async function main(): Promise<void> {
    const startTime = Date.now();
    console.info("START PSN Fetcher");

    const params: Params = getParams();
    const pool: Pool = buildPostgresPool();

    try {
        const psnAuthTokens: PsnAuthTokens = await getPsnAuthTokens(params.npsso);
        const psnData: PsnDataWrapper = await fetchPsnUserData(psnAuthTokens, params);
        await insertPsnData(pool, psnData);
        const appData: AppDataWrapper = computeAppData(psnData);
        await insertAppData(pool, appData);
    } finally {
        console.info("SUCCESS");
        const durationSeconds = (Date.now() - startTime) / 1000;
        console.info(`Total processing time: ${durationSeconds.toFixed(2)} s`);
        await pool.end();
    }
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
