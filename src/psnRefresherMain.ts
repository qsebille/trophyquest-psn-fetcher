import {getParams, Params} from "./config/params.js";
import {buildPostgresPool} from "./postgres/utils/buildPostgresPool.js";
import {Pool} from "pg";
import {getPsnAuthTokens, PsnAuthTokens} from "./auth/psnAuthTokens.js";
import {PsnUser} from "./psn/models/psnUser.js";
import {fetchPsnUser} from "./psn/fetchPsnUser.js";
import {PsnTitle} from "./psn/models/psnTitle.js";
import {fetchPsnTitles} from "./psn/fetchPsnTitles.js";
import {PostgresUserProfile} from "./postgres/models/postgresUserProfile.js";
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
import {getAllPsnUsers} from "./postgres/getAllPsnUsers.js";
import {updateUserProfileIntoPostgres} from "./postgres/updateUserProfilesIntoPostgres.js";
import {PsnUserPlayedTitle} from "./psn/models/psnUserPlayedTitle.js";
import {PsnTrophy} from "./psn/models/psnTrophy.js";
import {PsnEarnedTrophy} from "./psn/models/psnEarnedTrophy.js";


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
        // Authenticate and fetch user data
        const psnAuthTokens: PsnAuthTokens = await getPsnAuthTokens(params.npsso);

        // Fetch all users in psn schema
        const userProfiles: PostgresUserProfile[] = await getAllPsnUsers(pool);

        // For each user, retrieve all titles and trophy sets to update
        let psnUsers: PsnUser[] = [];
        let allTitlesToUpdate: PsnTitle[] = [];
        let allTrophySetsToUpdate: PsnTrophySet[] = [];
        let allTitleTrophySets: PsnTitleTrophySet[] = [];
        let allPlayedTitles: PsnUserPlayedTitle[] = [];
        let allTrophies: PsnTrophy[] = [];
        let allEarnedTrophies: PsnEarnedTrophy[] = [];
        for (const userProfile of userProfiles) {
            const userLastUpdate = new Date(userProfile.updated_at);
            const psnUser: PsnUser = await fetchPsnUser(psnAuthTokens, userProfile.name);
            const accountId: string = psnUser.id;
            console.info(`Fetched user ${userProfile.name} (${accountId}) from postgres database`);
            console.info(`Last update: ${userLastUpdate.toISOString()}`);

            // Fetch titles
            const allUserTitles: PsnTitle[] = await fetchPsnTitles(psnAuthTokens, accountId);
            const titlesToRefresh: PsnTitle[] = allUserTitles.filter(t => new Date(t.lastPlayedDateTime) > userLastUpdate);
            console.info(`Found ${titlesToRefresh.length} titles to update, among ${allUserTitles.length} total titles`);

            // Fetch trophy sets
            const trophySets: PsnTrophySet[] = await fetchPsnTrophySets(psnAuthTokens, accountId);
            const trophySetsToRefresh: PsnTrophySet[] = trophySets.filter(t => new Date(t.lastUpdatedDateTime) > userLastUpdate);
            console.info(`Found ${trophySetsToRefresh.length} trophy sets to update, among ${trophySets.length} total trophy sets`);
            const titleTrophySets: PsnTitleTrophySet[] = await fetchPsnTitlesTrophySet(titlesToRefresh, trophySetsToRefresh, psnAuthTokens, accountId);
            console.info(`Found ${titleTrophySets.length} titles / trophy sets links`);

            // Fetch trophies for each title
            const trophyResponse: PsnTrophyResponse = await fetchPsnUserTrophies(trophySetsToRefresh, psnAuthTokens, accountId);
            console.info(`Found ${trophyResponse.trophies.length} trophies to update`);
            console.info(`Found ${trophyResponse.earnedTrophies.length} earned trophies to update`);

            // Filtering data to update
            const playedTitlesToAdd: PsnUserPlayedTitle[] = titlesToRefresh.map(t => {
                return {
                    userId: psnUser.id,
                    titleId: t.id,
                    lastPlayedDateTime: t.lastPlayedDateTime,
                }
            });
            const titlesToUpdate: PsnTitle[] = titlesToRefresh.filter(t => !allUserTitles.some(ut => ut.id === t.id));
            const trophySetsToUpdate: PsnTrophySet[] = trophySetsToRefresh.filter(t => !trophySets.some(ut => ut.id === t.id));
            const trophiesToUpdate: PsnTrophy[] = trophyResponse.trophies.filter(t => !allTrophies.some(ut => ut.id === t.id));
            const earnedTrophiesToUpdate: PsnEarnedTrophy[] = trophyResponse.earnedTrophies.filter(t => !allEarnedTrophies.some(ut => ut.trophyId === t.trophyId));


            // Add data to arrays for insertion into postgres
            psnUsers = [...psnUsers, psnUser];
            allTitlesToUpdate = [...allTitlesToUpdate, ...titlesToUpdate];
            allPlayedTitles = [...allPlayedTitles, ...playedTitlesToAdd];
            allTrophySetsToUpdate = [...allTrophySetsToUpdate, ...trophySetsToUpdate];
            allTitleTrophySets = [...allTitleTrophySets, ...titleTrophySets];
            allTrophies = [...allTrophies, ...trophiesToUpdate];
            allEarnedTrophies = [...allEarnedTrophies, ...earnedTrophiesToUpdate];
        }

        console.info(`Found ${psnUsers.length} users to update`);
        console.info(`Found ${allTitlesToUpdate.length} titles to update`);
        console.info(`Found ${allPlayedTitles.length} played titles to update`);
        console.info(`Found ${allTrophySetsToUpdate.length} trophy sets to update`);
        console.info(`Found ${allTitleTrophySets.length} titles / trophy sets links to update`);
        console.info(`Found ${allTrophies.length} trophies to update`);
        console.info(`Found ${allEarnedTrophies.length} earned trophies to update`);

        // Insertion into postgres database
        await updateUserProfileIntoPostgres(pool, psnUsers);
        await insertTitlesIntoPostgres(pool, allTitlesToUpdate);
        await insertUserPlayedTitlesIntoPostgres(pool, allPlayedTitles);
        await insertTrophySetsIntoPostgres(pool, allTrophySetsToUpdate);
        await insertTitlesTrophySetIntoPostgres(pool, allTitleTrophySets);
        await insertTrophiesIntoPostgres(pool, allTrophies);
        await insertEarnedTrophiesIntoPostgres(pool, allEarnedTrophies);
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
