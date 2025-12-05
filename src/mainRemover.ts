import {getParams, Params} from "./config/params.js";
import {buildPostgresPool} from "./postgres/utils/buildPostgresPool.js";
import {Pool} from "pg";
import {getPsnAuthTokens, PsnAuthTokens} from "./auth/psnAuthTokens.js";
import {PsnUser} from "./psn/models/psnUser.js";
import {fetchPsnUser} from "./psn/fetchers/fetchPsnUser.js";
import {deleteUserProfile} from "./postgres/deleteUserProfile.js";


/**
 * Executes the primary workflow for removing a PSN user profile.
 * This includes fetching authentication tokens, retrieving the user profile,
 * and deleting the user data from a database. Logs the processing time and status.
 *
 * @return {Promise<void>} A promise that resolves when the workflow is complete.
 */
async function main(): Promise<void> {
    const startTime = Date.now();
    console.info("START PSN User remover")

    const params: Params = getParams();
    const pool: Pool = buildPostgresPool();

    try {
        const psnAuthTokens: PsnAuthTokens = await getPsnAuthTokens(params.npsso);
        const psnUser: PsnUser = await fetchPsnUser(psnAuthTokens, params.profileName);
        const accountId: string = psnUser.id;
        await deleteUserProfile(pool, accountId);
        console.info("SUCCESS");
    } finally {
        const durationSeconds = (Date.now() - startTime) / 1000;
        console.info(`Total processing time: ${durationSeconds.toFixed(2)} s`);
        await pool.end();
    }
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
