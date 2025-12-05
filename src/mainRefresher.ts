import {getParams, Params} from "./config/params.js";
import {buildPostgresPool} from "./postgres/utils/buildPostgresPool.js";
import {Pool} from "pg";
import {getPsnAuthTokens, PsnAuthTokens} from "./auth/psnAuthTokens.js";
import {AppPlayer} from "./app/models/appPlayer.js";
import {getAllPsnUsers} from "./postgres/queries/psn/getAllPsnUsers.js";
import {PsnDataWrapper} from "./psn/models/wrappers/psnDataWrapper.js";
import {refreshPsnData} from "./psn/refreshPsnData.js";
import {insertPsnData} from "./postgres/insertPsnData.js";
import {AppDataWrapper} from "./app/models/wrappers/appDataWrapper.js";
import computeAppData from "./app/computeAppData.js";
import {insertAppData} from "./postgres/insertAppData.js";


/**
 * Main method responsible for refreshing PlayStation Network (PSN) user data and syncing it with a PostgreSQL database.
 * This includes authenticating with PSN, retrieving user profiles, fetching titles, trophy sets, and updating the database
 * with the latest data for users, titles, trophy sets, and earned trophies.
 *
 * @return {Promise<void>} A Promise that resolves when the entire update process completes, including database operations, or rejects if an error occurs.
 */
async function main(): Promise<void> {
    const startTime = Date.now();
    console.info("START PSN Refresher")

    const params: Params = getParams();
    const pool: Pool = buildPostgresPool();

    try {
        const psnAuthTokens: PsnAuthTokens = await getPsnAuthTokens(params.npsso);
        const userProfiles: AppPlayer[] = await getAllPsnUsers(pool);
        const psnData: PsnDataWrapper = await refreshPsnData(userProfiles, psnAuthTokens);
        await insertPsnData(pool, psnData);
        const appData: AppDataWrapper = computeAppData(psnData);
        await insertAppData(pool, appData);
    } finally {
        const durationSeconds = (Date.now() - startTime) / 1000;
        console.info("SUCCESS");
        console.info(`Total processing time: ${durationSeconds.toFixed(2)} s`);
        await pool.end();
    }
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
