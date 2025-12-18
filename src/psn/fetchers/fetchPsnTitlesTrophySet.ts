import {PsnTitle} from "../models/psnTitle.js";
import {PsnTrophySet} from "../models/psnTrophySet.js";
import {PsnAuthTokens} from "../../auth/psnAuthTokens.js";
import {PsnTitleTrophySet} from "../models/psnTitleTrophySet.js";

const TITLE_CHUNK_SIZE = 5;

/**
 * Fetches and maps PlayStation Network (PSN) trophy sets for specific titles.
 *
 * @param {PsnTitle[]} titles - An array of PSN titles to retrieve trophy sets for.
 * @param {PsnTrophySet[]} trophySets - An array of available PSN trophy sets.
 * @param {PsnAuthTokens} psnAuthTokens - Authentication tokens required for accessing the PSN API.
 * @param {string} accountId - The PSN account ID to fetch trophy data for.
 * @return {Promise<PsnTitleTrophySet[]>} A promise that resolves to an array of objects containing title and trophy set IDs.
 */
export async function fetchPsnTitlesTrophySet(
    titles: PsnTitle[],
    trophySets: PsnTrophySet[],
    psnAuthTokens: PsnAuthTokens,
    accountId: string,
): Promise<PsnTitleTrophySet[]> {
    const {getUserTrophiesForSpecificTitle} = await import("psn-api");

    const trophySetIds: string[] = trophySets.map(t => t.id);
    const titleIds: string[] = titles.map(t => t.id);
    let result: PsnTitleTrophySet[] = [];
    for (let i = 0; i < titleIds.length; i += TITLE_CHUNK_SIZE) {
        const chunk: string[] = titleIds.slice(i, i + TITLE_CHUNK_SIZE);

        if (chunk.length === 0) {
            continue;
        }

        const options = {npTitleIds: chunk.join(",")};
        const trophySetResponse = await getUserTrophiesForSpecificTitle(psnAuthTokens, accountId, options);

        for (const title of trophySetResponse.titles) {
            for (const trophyTitle of title.trophyTitles) {
                if (trophySetIds.includes(trophyTitle.npCommunicationId)) {
                    result.push({
                        titleId: title.npTitleId,
                        trophySetId: trophyTitle.npCommunicationId,
                    });
                }
            }
        }
    }

    return result;
}