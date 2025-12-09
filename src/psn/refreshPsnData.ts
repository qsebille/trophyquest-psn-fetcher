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
    psnAuthTokens: PsnAuthTokens,
): Promise<PsnDataWrapper> {
    const result: PsnDataWrapper = {
        users: [],
        titles: [],
        trophySets: [],
        titleTrophySets: [],
        trophies: [],
        playedTitles: [],
        playedTrophySets: [],
        earnedTrophies: [],
    }

    const titleIds = new Set<string>();
    const trophySetIds = new Set<string>();
    const trophyIds = new Set<string>();
    for (const postgresUser of psnUsersPostgres) {
        // User info
        const psnUser: PsnUser = await fetchPsnUser(psnAuthTokens, postgresUser.name);
        const accountId: string = psnUser.id;
        const userLastUpdate = new Date(postgresUser.updated_at);
        console.info(`[PSN-REFRESH] Fetched user ${postgresUser.name} (${accountId}) from postgres database`);
        console.info(`[PSN-REFRESH::${postgresUser.name}] Fetching data from: ${userLastUpdate.toISOString()}`);

        // Fetch titles
        const titles: PsnTitle[] = await fetchPsnTitles(psnAuthTokens, accountId);
        const titlesToUpdate: PsnTitle[] = titles.filter(title => new Date(title.lastPlayedDateTime) > userLastUpdate);
        if (titlesToUpdate.length === 0) {
            console.info(`[PSN-REFRESH::${postgresUser.name}] No titles played since last update // Skipping user`);
            result.users.push(psnUser);
            continue;
        }
        const titlesToAdd: PsnTitle[] = titlesToUpdate.filter(title => !titleIds.has(title.id));
        console.info(`[PSN-REFRESH::${postgresUser.name}] Found ${titles.length} titles`);
        console.info(`[PSN-REFRESH::${postgresUser.name}] Found ${titlesToUpdate.length} titles played since last update`);
        console.info(`[PSN-REFRESH::${postgresUser.name}] Keeping ${titlesToAdd.length} titles to add to database`);

        // Fetch trophy sets
        const trophySets: PsnTrophySet[] = await fetchPsnTrophySets(psnAuthTokens, accountId);
        const trophySetsToUpdate: PsnTrophySet[] = trophySets.filter(trophySet => new Date(trophySet.lastUpdatedDateTime) > userLastUpdate);
        const trophySetsToAdd: PsnTrophySet[] = trophySetsToUpdate.filter(trophySet => !trophySetIds.has(trophySet.id));
        const titleTrophySetsToAdd: PsnTitleTrophySet[] = await fetchPsnTitlesTrophySet(titlesToAdd, trophySetsToAdd, psnAuthTokens, accountId);
        console.info(`[PSN-REFRESH::${postgresUser.name}] Found ${trophySets.length} trophy sets for user`);
        console.info(`[PSN-REFRESH::${postgresUser.name}] Found ${trophySetsToUpdate.length} trophy sets played since last update`);
        console.info(`[PSN-REFRESH::${postgresUser.name}] Keeping ${trophySetsToAdd.length} trophy sets to add to database`);
        console.info(`[PSN-REFRESH::${postgresUser.name}] Found ${titleTrophySetsToAdd.length} titles / trophy sets links to add to database`);

        // Fetch trophies
        const trophyResponse: PsnTrophyResponse = await fetchPsnUserTrophies(trophySetsToUpdate, psnAuthTokens, accountId);
        const trophies: PsnTrophy[] = trophyResponse.trophies;
        const trophiesToAdd: PsnTrophy[] = trophies.filter(trophy => !trophyIds.has(trophy.id));
        console.info(`[PSN-REFRESH::${postgresUser.name}] Found ${trophies.length} trophies`);
        console.info(`[PSN-REFRESH::${postgresUser.name}] Found ${trophiesToAdd.length} trophies to add`);

        // Player-related data
        const playedTitlesToUpdate: PsnPlayedTitle[] = titlesToUpdate.map(t => {
            return {userId: psnUser.id, titleId: t.id, lastPlayedDateTime: t.lastPlayedDateTime}
        });
        const playedTrophySets: PsnPlayedTrophySet[] = buildPsnPlayedTrophySet(psnUser, trophySetsToUpdate);
        const earnedTrophies: PsnEarnedTrophy[] = trophyResponse.earnedTrophies;
        const earnedTrophiesToAdd: PsnEarnedTrophy[] = earnedTrophies.filter(earnedTrophy => new Date(earnedTrophy.earnedDateTime) > userLastUpdate);
        console.info(`[PSN-REFRESH::${postgresUser.name}] Found ${playedTitlesToUpdate.length} played titles since last update`);
        console.info(`[PSN-REFRESH::${postgresUser.name}] Found ${playedTrophySets.length} played trophy sets since last update`);
        console.info(`[PSN-REFRESH::${postgresUser.name}] Found ${earnedTrophies.length} earned trophies`);
        console.info(`[PSN-REFRESH::${postgresUser.name}] Found ${earnedTrophiesToAdd.length} earned trophies since last update to add`);

        // Add data to sets to prevent duplicates between users
        titlesToAdd.forEach(title => titleIds.add(title.id));
        trophySetsToAdd.forEach(trophySet => trophySetIds.add(trophySet.id));
        trophiesToAdd.forEach(trophy => trophyIds.add(trophy.id));

        // Add data to arrays for insertion into postgres
        result.users.push(psnUser);
        result.titles.push(...titlesToAdd);
        result.trophySets.push(...trophySetsToAdd);
        result.titleTrophySets.push(...titleTrophySetsToAdd);
        result.trophies.push(...trophiesToAdd);
        result.playedTitles.push(...playedTitlesToUpdate);
        result.playedTrophySets.push(...playedTrophySets);
        result.earnedTrophies.push(...earnedTrophiesToAdd);
    }

    console.info(`[PSN-REFRESH] Found ${result.users.length} users to update`);
    console.info(`[PSN-REFRESH] Found ${result.titles.length} titles to update`);
    console.info(`[PSN-REFRESH] Found ${result.trophySets.length} played titles to update`);
    console.info(`[PSN-REFRESH] Found ${result.titleTrophySets.length} trophy sets to update`);
    console.info(`[PSN-REFRESH] Found ${result.trophies.length} played trophy sets to update`);
    console.info(`[PSN-REFRESH] Found ${result.playedTitles.length} titles / trophy sets links to update`);
    console.info(`[PSN-REFRESH] Found ${result.playedTrophySets.length} trophies to update`);
    console.info(`[PSN-REFRESH] Found ${result.earnedTrophies.length} earned trophies to update`);

    return result
}