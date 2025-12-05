import {PsnUser} from "./models/psnUser.js";
import {PsnTitle} from "./models/psnTitle.js";
import {PsnTrophySet} from "./models/psnTrophySet.js";
import {PsnTitleTrophySet} from "./models/psnTitleTrophySet.js";
import {PsnPlayedTitle} from "./models/psnPlayedTitle.js";
import {PsnTrophy} from "./models/psnTrophy.js";
import {PsnEarnedTrophy} from "./models/psnEarnedTrophy.js";
import {fetchPsnUser} from "./fetchers/fetchPsnUser.js";
import {fetchPsnTitles} from "./fetchers/fetchPsnTitles.js";
import {fetchPsnTrophySets} from "./fetchers/fetchPsnTrophySets.js";
import {fetchPsnTitlesTrophySet} from "./fetchers/fetchPsnTitlesTrophySet.js";
import {PsnTrophyResponse} from "./models/psnTrophyResponse.js";
import {fetchPsnUserTrophies} from "./fetchers/fetchPsnTrophies.js";
import {PsnAuthTokens} from "../auth/psnAuthTokens.js";
import {PsnDataWrapper} from "./models/wrappers/psnDataWrapper.js";
import {PsnPlayedTrophySet} from "./models/psnPlayedTrophySet.js";
import {buildPsnPlayedTrophySet} from "./builders/buildPsnPlayedTrophySet.js";
import {PsnUserProfilePostgres} from "../postgres/models/psnUserProfilePostgres.js";


/**
 * Refreshes and updates PlayStation Network (PSN) data for given users, including their titles, trophy sets, trophies, and earned trophies.
 *
 * @param {PsnUserProfilePostgres[]} psnUsersPostgres - List of PSN user profiles fetched from the Postgres database.
 * @param {PsnAuthTokens} psnAuthTokens - Authentication tokens required to access PSN APIs.
 * @return {Promise<PsnDataWrapper>} A promise resolving to an object encapsulating the updated PSN data, which includes users, titles, trophy sets, title-trophy set links, trophies, played titles, played trophy sets, and earned trophies.
 */
export async function refreshPsnData(
    psnUsersPostgres: PsnUserProfilePostgres[],
    psnAuthTokens: PsnAuthTokens
): Promise<PsnDataWrapper> {
    let psnUsers: PsnUser[] = [];
    let allTitlesToUpdate: PsnTitle[] = [];
    let allTrophySetsToUpdate: PsnTrophySet[] = [];
    let allTitleTrophySets: PsnTitleTrophySet[] = [];
    let allPlayedTitles: PsnPlayedTitle[] = [];
    let allPlayedTrophySets: PsnPlayedTrophySet[] = [];
    let allTrophies: PsnTrophy[] = [];
    let allEarnedTrophies: PsnEarnedTrophy[] = [];
    for (const postgresUser of psnUsersPostgres) {
        const userLastUpdate = new Date(postgresUser.updated_at);
        const psnUser: PsnUser = await fetchPsnUser(psnAuthTokens, postgresUser.name);
        const accountId: string = psnUser.id;
        console.info(`Fetched user ${postgresUser.name} (${accountId}) from postgres database`);
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
        const playedTrophySets: PsnPlayedTrophySet[] = buildPsnPlayedTrophySet(psnUser, trophySetsToRefresh);

        // Fetch trophies for each title
        const trophyResponse: PsnTrophyResponse = await fetchPsnUserTrophies(trophySetsToRefresh, psnAuthTokens, accountId);
        console.info(`Found ${trophyResponse.trophies.length} trophies to update`);
        console.info(`Found ${trophyResponse.earnedTrophies.length} earned trophies to update`);

        // Filtering data to update
        const playedTitlesToAdd: PsnPlayedTitle[] = titlesToRefresh.map(t => {
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
        allTrophySetsToUpdate = [...allTrophySetsToUpdate, ...trophySetsToUpdate];
        allTitleTrophySets = [...allTitleTrophySets, ...titleTrophySets];
        allTrophies = [...allTrophies, ...trophiesToUpdate];
        allPlayedTitles = [...allPlayedTitles, ...playedTitlesToAdd];
        allPlayedTrophySets = [...allPlayedTrophySets, ...playedTrophySets];
        allEarnedTrophies = [...allEarnedTrophies, ...earnedTrophiesToUpdate];
    }

    console.info(`Found ${psnUsers.length} users to update`);
    console.info(`Found ${allTitlesToUpdate.length} titles to update`);
    console.info(`Found ${allPlayedTitles.length} played titles to update`);
    console.info(`Found ${allTrophySetsToUpdate.length} trophy sets to update`);
    console.info(`Found ${allPlayedTrophySets.length} played trophy sets to update`);
    console.info(`Found ${allTitleTrophySets.length} titles / trophy sets links to update`);
    console.info(`Found ${allTrophies.length} trophies to update`);
    console.info(`Found ${allEarnedTrophies.length} earned trophies to update`);

    return {
        users: psnUsers,
        titles: allTitlesToUpdate,
        trophySets: allTrophySetsToUpdate,
        titleTrophySets: allTitleTrophySets,
        trophies: allTrophies,
        playedTitles: allPlayedTitles,
        playedTrophySets: allPlayedTrophySets,
        earnedTrophies: allEarnedTrophies,
    };
}