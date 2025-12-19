import {PsnUser} from "./models/psnUser.js";
import {PsnTitle} from "./models/psnTitle.js";
import {fetchPsnTitlesForUser} from "./fetchers/fetchPsnTitlesForUser.js";
import {PsnTrophyResponse} from "./models/psnTrophyResponse.js";
import {fetchPsnUserTrophies} from "./fetchers/fetchPsnTrophies.js";
import {PsnAuthTokens} from "../auth/psnAuthTokens.js";
import {PsnDataWrapper} from "./models/wrappers/psnDataWrapper.js";
import {fetchPsnUser} from "./fetchers/fetchPsnUser.js";
import {PsnPlayedTitle} from "./models/psnPlayedTitle.js";
import {buildPsnPlayedTitle} from "./builders/buildPsnPlayedTitle.js";

export async function fetchPsnUserData(
    psnAuthTokens: PsnAuthTokens,
    profileName: string,
    concurrency: number,
): Promise<PsnDataWrapper> {
    const psnUser: PsnUser = await fetchPsnUser(psnAuthTokens, profileName);
    const accountId: string = psnUser.id;
    console.info(`PSN API: Fetched user ${psnUser.profileName} (${accountId})`);

    // Fetch titles and trophy sets for a user
    const psnTitleList: PsnTitle[] = await fetchPsnTitlesForUser(psnAuthTokens, accountId);
    const psnPlayedTitleList: PsnPlayedTitle[] = buildPsnPlayedTitle(psnUser, psnTitleList);
    console.info(`PSN API: Found ${psnTitleList.length} trophy sets`);

    // Fetch trophies for each title
    const trophyResponse: PsnTrophyResponse = await fetchPsnUserTrophies(psnTitleList, psnAuthTokens, accountId, concurrency);
    console.info(`PSN API: Found ${trophyResponse.trophies.length} trophies`);
    console.info(`PSN API: Found ${trophyResponse.earnedTrophies.length} earned trophies`);

    return {
        users: [psnUser],
        titles: psnTitleList,
        trophies: trophyResponse.trophies,
        playedTitles: psnPlayedTitleList,
        earnedTrophies: trophyResponse.earnedTrophies,
    };
}