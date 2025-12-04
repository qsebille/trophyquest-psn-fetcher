import {PsnUser} from "./models/psnUser.js";
import {PsnTitle} from "./models/psnTitle.js";
import {PsnTrophySet} from "./models/psnTrophySet.js";
import {PsnTitleTrophySet} from "./models/psnTitleTrophySet.js";
import {PsnUserPlayedTitle} from "./models/psnUserPlayedTitle.js";
import {PsnTrophy} from "./models/psnTrophy.js";
import {PsnEarnedTrophy} from "./models/psnEarnedTrophy.js";
import {fetchPsnUser} from "./fetchers/fetchPsnUser.js";
import {fetchPsnTitles} from "./fetchers/fetchPsnTitles.js";
import {fetchPsnTrophySets} from "./fetchers/fetchPsnTrophySets.js";
import {fetchPsnTitlesTrophySet} from "./fetchers/fetchPsnTitlesTrophySet.js";
import {PsnTrophyResponse} from "./models/psnTrophyResponse.js";
import {fetchPsnUserTrophies} from "./fetchers/fetchPsnTrophies.js";
import {PostgresUserProfile} from "../postgres/models/postgresUserProfile.js";
import {PsnAuthTokens} from "../auth/psnAuthTokens.js";
import {PsnRefreshData} from "./models/wrappers/psnRefreshData.js";

/**
 * Fetches and refreshes PlayStation Network (PSN) data for multiple user profiles.
 * This includes updated user information, titles, played titles, trophy sets, trophy links, trophies, and earned trophies.
 *
 * @param {PostgresUserProfile[]} userProfiles - An array of user profiles from the Postgres database to fetch and refresh data for.
 * @param {PsnAuthTokens} psnAuthTokens - The authentication tokens required to interact with the PSN API.
 * @return {Promise<PsnRefreshData>} A promise that resolves with the refreshed PSN data, including updated users, titles, played titles, trophy sets, title-trophy associations, trophies, and earned trophies.
 */
export async function fetchRefreshData(
    userProfiles: PostgresUserProfile[],
    psnAuthTokens: PsnAuthTokens
): Promise<PsnRefreshData> {
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

    return {
        users: psnUsers,
        titles: allTitlesToUpdate,
        playedTitles: allPlayedTitles,
        trophySets: allTrophySetsToUpdate,
        titleTrophySets: allTitleTrophySets,
        trophies: allTrophies,
        earnedTrophies: allEarnedTrophies,
    };
}