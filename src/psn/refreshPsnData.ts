import {PsnUser} from "./models/psnUser.js";
import {PsnTitle} from "./models/psnTitle.js";
import {PsnTrophy} from "./models/psnTrophy.js";
import {PsnEarnedTrophy} from "./models/psnEarnedTrophy.js";
import {fetchPsnUser} from "./fetchers/fetchPsnUser.js";
import {fetchPsnTitlesForUser} from "./fetchers/fetchPsnTitlesForUser.js";
import {PsnTrophyResponse} from "./models/psnTrophyResponse.js";
import {fetchPsnUserTrophies} from "./fetchers/fetchPsnTrophies.js";
import {PsnAuthTokens} from "../auth/psnAuthTokens.js";
import {PsnDataWrapper} from "./models/wrappers/psnDataWrapper.js";
import {PsnPlayedTitle} from "./models/psnPlayedTitle.js";
import {buildPsnPlayedTitle} from "./builders/buildPsnPlayedTitle.js";
import {ProfileToRefresh} from "../postgres/models/profileToRefresh.js";


export async function refreshPsnData(
    profileToRefreshList: ProfileToRefresh[],
    psnAuthTokens: PsnAuthTokens,
): Promise<PsnDataWrapper> {
    const result: PsnDataWrapper = {
        users: [],
        titles: [],
        trophies: [],
        playedTitles: [],
        earnedTrophies: [],
    }

    const titleIds = new Set<string>();
    const trophyIds = new Set<string>();
    for (const profileToRefresh of profileToRefreshList) {
        // User info
        const userPseudo = profileToRefresh.pseudo;
        const updateFrom = profileToRefresh.lastPlayedTimestamp;
        const psnUser: PsnUser = await fetchPsnUser(psnAuthTokens, userPseudo);
        const accountId: string = psnUser.id;
        console.info(`Postgres (schema psn): Fetched user ${userPseudo} (${accountId})`);
        console.info(`[User ${userPseudo}] Last played time: ${updateFrom.toISOString()}`);

        // Fetch titles
        const titles: PsnTitle[] = await fetchPsnTitlesForUser(psnAuthTokens, accountId);
        const titlesToUpdate: PsnTitle[] = titles.filter(t => new Date(t.lastUpdatedDateTime) > updateFrom);
        const titlesToAdd: PsnTitle[] = titlesToUpdate.filter(t => !titleIds.has(t.id));
        console.info(`[User ${userPseudo}] Found ${titles.length} titles for user`);
        console.info(`[User ${userPseudo}] Found ${titlesToUpdate.length} titles played since last update`);
        console.info(`[User ${userPseudo}] Keeping ${titlesToAdd.length} titles to add to database`);

        // Fetch trophies
        const trophyResponse: PsnTrophyResponse = await fetchPsnUserTrophies(titlesToUpdate, psnAuthTokens, accountId, 1);
        const trophies: PsnTrophy[] = trophyResponse.trophies;
        const trophiesToAdd: PsnTrophy[] = trophies.filter(trophy => !trophyIds.has(trophy.id));
        console.info(`[User ${userPseudo}] Found ${trophies.length} trophies`);
        console.info(`[User ${userPseudo}] Found ${trophiesToAdd.length} trophies to add`);

        // Player-related data
        const playedTitles: PsnPlayedTitle[] = buildPsnPlayedTitle(psnUser, titlesToUpdate);
        const earnedTrophies: PsnEarnedTrophy[] = trophyResponse.earnedTrophies;
        const earnedTrophiesToAdd: PsnEarnedTrophy[] = earnedTrophies.filter(earnedTrophy => new Date(earnedTrophy.earnedDateTime) > updateFrom);
        console.info(`[User ${userPseudo}] Found ${playedTitles.length} played trophy sets since last update`);
        console.info(`[User ${userPseudo}] Found ${earnedTrophies.length} earned trophies`);
        console.info(`[User ${userPseudo}] Found ${earnedTrophiesToAdd.length} earned trophies since last update to add`);

        // Add data to sets to prevent duplicates between users
        titlesToAdd.forEach(t => titleIds.add(t.id));
        trophiesToAdd.forEach(t => trophyIds.add(t.id));

        // Add data to arrays for insertion into postgres
        result.users.push(psnUser);
        result.titles.push(...titlesToAdd);
        result.trophies.push(...trophiesToAdd);
        result.playedTitles.push(...playedTitles);
        result.earnedTrophies.push(...earnedTrophiesToAdd);
    }

    console.info(`PSN API: Found ${result.users.length} users to update`);
    console.info(`PSN API: Found ${result.titles.length} titles to update`);
    console.info(`PSN API: Found ${result.playedTitles.length} played titles to update`);
    console.info(`PSN API: Found ${result.trophies.length} trophies to update`);
    console.info(`PSN API: Found ${result.earnedTrophies.length} earned trophies to update`);

    return result
}