import {getParams, Params} from "./config/params.js";
import {buildPostgresPool} from "./postgres/utils/buildPostgresPool.js";
import {Pool} from "pg";
import {getPsnAuthTokens, PsnAuthTokens} from "./auth/psnAuthTokens.js";
import {PsnUser} from "./psn/models/psnUser.js";
import {fetchPsnUser} from "./psn/fetchPsnUser.js";
import {fetchUserProfile} from "./postgres/fetchUserProfile.js";
import {PsnTitle} from "./psn/models/psnTitle.js";
import {fetchPsnTitles} from "./psn/fetchPsnTitles.js";
import {PostgresUserProfile} from "./postgres/models/postgresUserProfile.js";
import {upsertUserProfileIntoPostgres} from "./postgres/upsertUserProfileIntoPostgres.js";
import {PsnTrophySet} from "./psn/models/psnTrophySet.js";
import {fetchPsnTrophySets} from "./psn/fetchPsnTrophySets.js";
import {PsnTitleTrophySet} from "./psn/models/psnTitleTrophySet.js";
import {fetchPsnTitlesTrophySet} from "./psn/fetchPsnTitlesTrophySet.js";
import {fetchPsnUserTrophies} from "./psn/fetchPsnTrophies.js";
import {PsnTrophyResponse} from "./psn/models/psnTrophyResponse.js";
import {insertTitlesIntoPostgres} from "./postgres/insertTitlesIntoPostgres.js";
import {insertUserPlayedTitlesIntoPostgres} from "./postgres/insertUserPlayedTitlesIntoPostgres.js";
import {insertTrophySetsIntoPostgres} from "./postgres/insertTrophySetsIntoPostgres.js";
import {insertTitlesTrophySetIntoPostgres} from "./postgres/insertTitlesTrophySetIntoPostgres.js";
import {insertTrophiesIntoPostgres} from "./postgres/insertTrophiesIntoPostgres.js";
import {insertEarnedTrophiesIntoPostgres} from "./postgres/insertEarnedTrophiesIntoPostgres.js";

/**
 * The `main` function serves as the primary entry point for executing the PSN (PlayStation Network) data refresher process.
 * It performs several tasks, including user authentication, retrieving and processing user data, and updating a Postgres database.
 *
 * The function executes the following steps:
 * - Authenticates with the PSN API using provided credentials.
 * - Fetches user information, titles, trophy sets, and related data from PSN.
 * - Compares and determines the need for updates based on the user's last update timestamp.
 * - Updates or inserts the latest user data and associated trophies into the Postgres database.
 * - Logs information and processing steps for tracking and debugging.
 *
 * @return {Promise<void>} A promise that resolves when the process completes successfully or rejects if any errors occur during execution.
 */
async function main() {
    const startTime = Date.now();
    console.info("START PSN Refresher")

    const params: Params = getParams();
    const pool: Pool = buildPostgresPool();

    try {
        // Authenticate and fetch user data
        const psnAuthTokens: PsnAuthTokens = await getPsnAuthTokens(params.npsso);
        const psnUser: PsnUser = await fetchPsnUser(psnAuthTokens, params.profileName);
        const accountId: string = psnUser.id;

        // Fetch postgres user
        const userProfile: PostgresUserProfile = await fetchUserProfile(pool, accountId);
        const userLastUpdate = new Date(userProfile.updated_at);
        console.info(`Fetched user ${userProfile.name} (${accountId}) from postgres database`);
        console.info(`Last update: ${userLastUpdate.toISOString()}`);

        // Fetch titles
        const titles: PsnTitle[] = await fetchPsnTitles(psnAuthTokens, accountId);
        const titlesToUpdate = titles.filter(t => new Date(t.lastPlayedDateTime) > userLastUpdate);
        if (titlesToUpdate.length === 0) {
            console.info("No titles to update");

            // Insert user into postgres database to update refresh time
            await upsertUserProfileIntoPostgres(pool, psnUser);
            return;
        }
        console.info(`Found ${titlesToUpdate.length} titles to update, among ${titles.length} total titles`);

        // Fetch trophy sets
        const trophySets: PsnTrophySet[] = await fetchPsnTrophySets(psnAuthTokens, accountId);
        const trophySetsToUpdate: PsnTrophySet[] = trophySets.filter(t => new Date(t.lastUpdatedDateTime) > userLastUpdate);
        console.info(`Found ${trophySetsToUpdate.length} trophy sets to update, among ${trophySets.length} total trophy sets`);
        const titleTrophySets: PsnTitleTrophySet[] = await fetchPsnTitlesTrophySet(titlesToUpdate, trophySetsToUpdate, psnAuthTokens, accountId);
        console.info(`Found ${titleTrophySets.length} titles / trophy sets links`)

        // Fetch trophies for each title
        const trophyResponse: PsnTrophyResponse = await fetchPsnUserTrophies(trophySetsToUpdate, psnAuthTokens, accountId);
        console.info(`Found ${trophyResponse.trophies.length} trophies to update`);
        console.info(`Found ${trophyResponse.earnedTrophies.length} earned trophies to update`);

        // Insertion into postgres database
        await upsertUserProfileIntoPostgres(pool, psnUser);
        await insertTitlesIntoPostgres(pool, titles);
        await insertUserPlayedTitlesIntoPostgres(pool, psnUser, titles);
        await insertTrophySetsIntoPostgres(pool, trophySets);
        await insertTitlesTrophySetIntoPostgres(pool, titleTrophySets);
        await insertTrophiesIntoPostgres(pool, trophyResponse.trophies);
        await insertEarnedTrophiesIntoPostgres(pool, trophyResponse.earnedTrophies);
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
