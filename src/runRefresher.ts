import {buildPostgresPool} from "./postgres/utils/buildPostgresPool.js";
import {Pool} from "pg";
import {getPsnAuthTokens, PsnAuthTokens} from "./auth/psnAuthTokens.js";
import {getAllPsnUsers} from "./postgres/queries/psn/getAllPsnUsers.js";
import {PsnDataWrapper} from "./psn/models/wrappers/psnDataWrapper.js";
import {refreshPsnData} from "./psn/refreshPsnData.js";
import {insertPsnData} from "./postgres/insertPsnData.js";
import {AppDataWrapper} from "./app/models/wrappers/appDataWrapper.js";
import {computeAppData} from "./app/computeAppData.js";
import {insertAppData} from "./postgres/insertAppData.js";
import {PsnUserProfilePostgres} from "./postgres/models/psnUserProfilePostgres.js";
import {getMandatoryParam} from "./config/getMandatoryParam.js";


/**
 * Main method responsible for refreshing PlayStation Network (PSN) user data and syncing it with a PostgreSQL database.
 * This includes authenticating with PSN, retrieving user profiles, fetching titles, trophy sets, and updating the database
 * with the latest data for users, titles, trophy sets, and earned trophies.
 *
 * @return {Promise<void>} A Promise that resolves when the entire update process completes, including database operations, or rejects if an error occurs.
 */
async function runRefresher(): Promise<void> {
    const startTime = Date.now();
    console.info("Start PSN Refresher function");

    const npsso: string = getMandatoryParam('NPSSO');
    const pool: Pool = buildPostgresPool();

    try {
        const psnAuthTokens: PsnAuthTokens = await getPsnAuthTokens(npsso);
        const psnUsersPostgres: PsnUserProfilePostgres[] = await getAllPsnUsers(pool);
        const psnData: PsnDataWrapper = await refreshPsnData(psnUsersPostgres, psnAuthTokens);
        const appData: AppDataWrapper = computeAppData(psnData);
        await insertPsnData(pool, psnData);
        await insertAppData(pool, appData);
        console.info("PSN Refresher : Success");
    } finally {
        const durationSeconds = (Date.now() - startTime) / 1000;
        console.info(`Total processing time: ${durationSeconds.toFixed(2)} s`);
        await pool.end();
    }
}

export const handler = async (
    _event: any = {},
    _context: any = {}
): Promise<void> => {
    await runRefresher();
};

if (!process.env.LAMBDA_TASK_ROOT) {
    runRefresher().catch((e) => {
        console.error(e);
        process.exitCode = 1;
    });
}