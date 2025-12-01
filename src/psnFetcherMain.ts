import {getParams, Params} from "./config/params.js";
import {buildPostgresPool} from "./postgres/utils/buildPostgresPool.js";
import {Pool} from "pg";
import {getPsnAuthTokens, PsnAuthTokens} from "./auth/psnAuthTokens.js";
import {PsnUser} from "./psn/models/psnUser.js";
import {fetchPsnUser} from "./psn/fetchPsnUser.js";
import {PsnTitle} from "./psn/models/psnTitle.js";
import {fetchPsnTitles} from "./psn/fetchPsnTitles.js";
import {PsnTrophySet} from "./psn/models/psnTrophySet.js";
import {fetchPsnTrophySets} from "./psn/fetchPsnTrophySets.js";
import {fetchPsnTitlesTrophySet} from "./psn/fetchPsnTitlesTrophySet.js";
import {PsnTitleTrophySet} from "./psn/models/psnTitleTrophySet.js";
import {fetchPsnUserTrophies} from "./psn/fetchPsnTrophies.js";
import {insertTitlesIntoPostgres} from "./postgres/insertTitlesIntoPostgres.js";
import {insertUserPlayedTitlesIntoPostgres} from "./postgres/insertUserPlayedTitlesIntoPostgres.js";
import {insertTrophySetsIntoPostgres} from "./postgres/insertTrophySetsIntoPostgres.js";
import {insertTitlesTrophySetIntoPostgres} from "./postgres/insertTitlesTrophySetIntoPostgres.js";
import {upsertUserProfileIntoPostgres} from "./postgres/upsertUserProfileIntoPostgres.js";
import {PsnTrophyResponse} from "./psn/models/psnTrophyResponse.js";
import {insertTrophiesIntoPostgres} from "./postgres/insertTrophiesIntoPostgres.js";
import {insertEarnedTrophiesIntoPostgres} from "./postgres/insertEarnedTrophiesIntoPostgres.js";


/**
 * Main method that coordinates the fetching, processing, and storing of PlayStation Network (PSN) user data, including titles, trophy sets, trophies, and earned trophies.
 * It authenticates the user, retrieves data from the PSN API, and inserts the processed data into a PostgreSQL database.
 *
 * @return {Promise<void>} A promise that resolves when the entire process is completed successfully, or rejects if any errors occur during execution.
 */
async function main() {
    const startTime = Date.now();
    console.info("START PSN Fetcher")

    const params: Params = getParams();
    const pool: Pool = buildPostgresPool();

    try {
        // Authenticate and fetch user data
        const psnAuthTokens: PsnAuthTokens = await getPsnAuthTokens(params.npsso);
        const psnUser: PsnUser = await fetchPsnUser(psnAuthTokens, params.profileName);
        const accountId: string = psnUser.id;
        console.info(`Fetched user ${psnUser.profileName} (${accountId}) from PSN API`);

        // Fetch titles and trophy sets for a user
        const titles: PsnTitle[] = await fetchPsnTitles(psnAuthTokens, accountId);
        console.info(`Found ${titles.length} titles`);
        const trophySets: PsnTrophySet[] = await fetchPsnTrophySets(psnAuthTokens, accountId);
        console.info(`Found ${trophySets.length} trophy sets`);
        const titleTrophySets: PsnTitleTrophySet[] = await fetchPsnTitlesTrophySet(titles, trophySets, psnAuthTokens, accountId);
        console.info(`Found ${titleTrophySets.length} titles / trophy sets links`);

        // Fetch trophies for each title
        const trophyResponse: PsnTrophyResponse = await fetchPsnUserTrophies(trophySets, psnAuthTokens, accountId);
        console.info(`Found ${trophyResponse.trophies.length} trophies`);
        console.info(`Found ${trophyResponse.earnedTrophies.length} earned trophies`);

        // Insertion into postgres database
        await upsertUserProfileIntoPostgres(pool, psnUser);
        await insertTitlesIntoPostgres(pool, titles);
        await insertUserPlayedTitlesIntoPostgres(pool, psnUser, titles);
        await insertTrophySetsIntoPostgres(pool, trophySets);
        await insertTitlesTrophySetIntoPostgres(pool, titleTrophySets);
        await insertTrophiesIntoPostgres(pool, trophyResponse.trophies);
        await insertEarnedTrophiesIntoPostgres(pool, trophyResponse.earnedTrophies);

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
