import {PsnUser} from "./models/psnUser.js";
import {PsnTitle} from "./models/psnTitle.js";
import {PsnTrophySet} from "./models/psnTrophySet.js";
import {PsnTitleTrophySet} from "./models/psnTitleTrophySet.js";
import {PsnPlayedTitle} from "./models/psnPlayedTitle.js";
import {fetchPsnTitles} from "./fetchers/fetchPsnTitles.js";
import {fetchPsnTrophySets} from "./fetchers/fetchPsnTrophySets.js";
import {fetchPsnTitlesTrophySet} from "./fetchers/fetchPsnTitlesTrophySet.js";
import {PsnTrophyResponse} from "./models/psnTrophyResponse.js";
import {fetchPsnUserTrophies} from "./fetchers/fetchPsnTrophies.js";
import {PsnAuthTokens} from "../auth/psnAuthTokens.js";
import {PsnDataWrapper} from "./models/wrappers/psnDataWrapper.js";
import {fetchPsnUser} from "./fetchers/fetchPsnUser.js";
import {PsnPlayedTrophySet} from "./models/psnPlayedTrophySet.js";
import {buildPsnPlayedTrophySet} from "./builders/buildPsnPlayedTrophySet.js";

export async function fetchPsnUserData(
    psnAuthTokens: PsnAuthTokens,
    profileName: string,
): Promise<PsnDataWrapper> {
    const psnUser: PsnUser = await fetchPsnUser(psnAuthTokens, profileName);
    const accountId: string = psnUser.id;
    console.info(`PSN API: Fetched user ${psnUser.profileName} (${accountId})`);

    // Fetch titles and trophy sets for a user
    const titles: PsnTitle[] = await fetchPsnTitles(psnAuthTokens, accountId);
    const playedTitles: PsnPlayedTitle[] = titles.map(t => {
        return {userId: accountId, titleId: t.id, lastPlayedDateTime: t.lastPlayedDateTime};
    });
    console.info(`PSN API: Found ${titles.length} titles`);
    const trophySets: PsnTrophySet[] = await fetchPsnTrophySets(psnAuthTokens, accountId);
    const playedTrophySets: PsnPlayedTrophySet[] = buildPsnPlayedTrophySet(psnUser, trophySets);
    console.info(`PSN API: Found ${trophySets.length} trophy sets`);
    const titleTrophySets: PsnTitleTrophySet[] = await fetchPsnTitlesTrophySet(titles, trophySets, psnAuthTokens, accountId);
    console.info(`PSN API: Found ${titleTrophySets.length} titles / trophy sets links`);

    // Fetch trophies for each title
    const trophyResponse: PsnTrophyResponse = await fetchPsnUserTrophies(trophySets, psnAuthTokens, accountId);
    console.info(`PSN API: Found ${trophyResponse.trophies.length} trophies`);
    console.info(`PSN API: Found ${trophyResponse.earnedTrophies.length} earned trophies`);

    return {
        users: [psnUser],
        titles: titles,
        trophySets: trophySets,
        titleTrophySets: titleTrophySets,
        trophies: trophyResponse.trophies,
        playedTitles: playedTitles,
        playedTrophySets: playedTrophySets,
        earnedTrophies: trophyResponse.earnedTrophies,
    };
}