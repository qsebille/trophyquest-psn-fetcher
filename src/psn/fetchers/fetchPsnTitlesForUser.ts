import {PsnAuthTokens} from "../../auth/psnAuthTokens.js";
import {PsnTitle} from "../models/psnTitle.js";
import {normalizePsnPlatform} from "../utils/normalizePsnPlatform.js";
import {UserTitlesResponse} from "psn-api";

const PSN_TITLE_BATCH_SIZE: number = 200

export async function fetchPsnTitlesForUser(
    psnAuthTokens: PsnAuthTokens,
    accountId: string
): Promise<PsnTitle[]> {
    const {getUserTitles} = await import("psn-api");

    let offset = 0;
    const result: PsnTitle[] = [];
    while (true) {
        const options = {limit: PSN_TITLE_BATCH_SIZE, offset};
        const userTitlesResponse: UserTitlesResponse = await getUserTitles(psnAuthTokens, accountId, options);
        const userSets: PsnTitle[] = userTitlesResponse.trophyTitles.map(trophyTitle => {
            const platform: string = normalizePsnPlatform(trophyTitle.trophyTitlePlatform)
            return {
                id: trophyTitle.npCommunicationId,
                serviceName: trophyTitle.npServiceName,
                name: trophyTitle.trophyTitleName,
                iconUrl: trophyTitle.trophyTitleIconUrl,
                version: trophyTitle.trophySetVersion,
                lastUpdatedDateTime: trophyTitle.lastUpdatedDateTime,
                platform,
            } as PsnTitle;
        });
        result.push(...userSets);
        if (userTitlesResponse.nextOffset === undefined) break;
        offset = userTitlesResponse.nextOffset;
    }

    return result;
}