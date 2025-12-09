import {PsnAuthTokens} from "../../auth/psnAuthTokens.js";
import {PsnTrophySet} from "../models/psnTrophySet.js";
import {normalizePsnPlatform} from "../utils/normalizePsnPlatform.js";

const PSN_TITLE_BATCH_SIZE: number = 200

/**
 * Fetches PlayStation Network (PSN) trophy sets for a given account ID, using the provided authentication tokens.
 *
 * @param {PsnAuthTokens} psnAuthTokens - The authentication tokens required to access the PSN API.
 * @param {string} accountId - The account ID for the user whose trophy sets are being retrieved.
 * @return {Promise<PsnTrophySet[]>} A promise that resolves to an array of PSN trophy sets.
 */
export async function fetchPsnTrophySets(
    psnAuthTokens: PsnAuthTokens,
    accountId: string
): Promise<PsnTrophySet[]> {
    // @ts-ignore
    const {getUserTitles} = await import("psn-api");

    let offset = 0;
    const result: PsnTrophySet[] = [];
    while (true) {
        const options = {limit: PSN_TITLE_BATCH_SIZE, offset};
        const userTitlesResponse = await getUserTitles(psnAuthTokens, accountId, options);
        // @ts-ignore
        const userSets = userTitlesResponse.trophyTitles.map(trophyTitle => {
            const platform: string = normalizePsnPlatform(trophyTitle.trophyTitlePlatform)
            return {
                id: trophyTitle.npCommunicationId,
                psnId: trophyTitle.npCommunicationId,
                serviceName: trophyTitle.npServiceName,
                name: trophyTitle.trophyTitleName,
                iconUrl: trophyTitle.trophyTitleIconUrl,
                version: trophyTitle.trophySetVersion,
                lastUpdatedDateTime: trophyTitle.lastUpdatedDateTime,
                platform,
            } as PsnTrophySet;
        });
        result.push(...userSets);
        if (userTitlesResponse.nextOffset === undefined) break;
        offset = userTitlesResponse.nextOffset;
    }

    return result;
}