import {getParams, Params} from "./config/params.js";
import {buildPostgresPool} from "./postgres/utils/buildPostgresPool.js";
import {Pool} from "pg";
import {getPsnAuthTokens, PsnAuthTokens} from "./auth/psnAuthTokens.js";
import {PostgresUserProfile} from "./postgres/models/postgresUserProfile.js";
import {insertTitlesIntoPostgres} from "./postgres/insertTitlesIntoPostgres.js";
import {insertUserPlayedTitlesIntoPostgres} from "./postgres/insertUserPlayedTitlesIntoPostgres.js";
import {insertTrophySetsIntoPostgres} from "./postgres/insertTrophySetsIntoPostgres.js";
import {insertTitlesTrophySetIntoPostgres} from "./postgres/insertTitlesTrophySetIntoPostgres.js";
import {insertTrophiesIntoPostgres} from "./postgres/insertTrophiesIntoPostgres.js";
import {insertEarnedTrophiesIntoPostgres} from "./postgres/insertEarnedTrophiesIntoPostgres.js";
import {getAllPsnUsers} from "./postgres/getAllPsnUsers.js";
import {updateUserProfileIntoPostgres} from "./postgres/updateUserProfilesIntoPostgres.js";
import {PsnRefreshData} from "./psn/models/wrappers/psnRefreshData.js";
import {fetchRefreshData} from "./psn/fetchRefreshData.js";


/**
 * Main method responsible for refreshing PlayStation Network (PSN) user data and syncing it with a PostgreSQL database.
 * This includes authenticating with PSN, retrieving user profiles, fetching titles, trophy sets, and updating the database
 * with the latest data for users, titles, trophy sets, and earned trophies.
 *
 * @return {Promise<void>} A Promise that resolves when the entire update process completes, including database operations, or rejects if an error occurs.
 */
async function main() {
    const startTime = Date.now();
    console.info("START PSN Refresher")

    const params: Params = getParams();
    const pool: Pool = buildPostgresPool();

    try {
        const psnAuthTokens: PsnAuthTokens = await getPsnAuthTokens(params.npsso);
        const userProfiles: PostgresUserProfile[] = await getAllPsnUsers(pool);
        const refreshData: PsnRefreshData = await fetchRefreshData(userProfiles, psnAuthTokens);


        // Insertion into postgres database
        await updateUserProfileIntoPostgres(pool, refreshData.users);
        await insertTitlesIntoPostgres(pool, refreshData.titles);
        await insertUserPlayedTitlesIntoPostgres(pool, refreshData.playedTitles);
        await insertTrophySetsIntoPostgres(pool, refreshData.trophySets);
        await insertTitlesTrophySetIntoPostgres(pool, refreshData.titleTrophySets);
        await insertTrophiesIntoPostgres(pool, refreshData.trophies);
        await insertEarnedTrophiesIntoPostgres(pool, refreshData.earnedTrophies);
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
