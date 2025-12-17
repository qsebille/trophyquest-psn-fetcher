import {PsnAuthTokens} from "../../auth/psnAuthTokens.js";
import {PsnTrophySet} from "../models/psnTrophySet.js";
import {PsnTrophy} from "../models/psnTrophy.js";
import {PsnEarnedTrophy} from "../models/psnEarnedTrophy.js";
import {PsnTrophyResponse} from "../models/psnTrophyResponse.js";
import {fetchPsnTrophiesForSet} from "./fetchPsnTrophiesForSet.js";
import {fetchPsnEarnedTrophiesForSet} from "./fetchPsnEarnedTrophiesForSet.js";

/**
 * Fetches the PlayStation Network (PSN) user's trophies for the provided trophy sets.
 *
 * @param {PsnTrophySet[]} trophySets - An array of PSN trophy sets to fetch trophies for.
 * @param {PsnAuthTokens} psnAuthTokens - The authentication tokens required to access the PSN API.
 * @param {string} accountId - The user's PSN account ID.
 * @return {Promise<PsnTrophyResponse>} A promise that resolves to an object containing the fetched trophies and earned trophies.
 */
export async function fetchPsnUserTrophies(
    trophySets: PsnTrophySet[],
    psnAuthTokens: PsnAuthTokens,
    accountId: string
): Promise<PsnTrophyResponse> {
    let trophies: PsnTrophy[] = [];
    let earnedTrophies: PsnEarnedTrophy[] = [];

    for (const trophySet of trophySets) {
        const currentTrophies: PsnTrophy[] = await fetchPsnTrophiesForSet(trophySet, psnAuthTokens);
        const currentEarnedTrophies: PsnEarnedTrophy[] = await fetchPsnEarnedTrophiesForSet(trophySet, psnAuthTokens, accountId);
        console.info(`PSN API: Fetched ${currentTrophies.length} trophies and ${currentEarnedTrophies.length} earned trophies for ${trophySet.name} (${trophySet.id})`);

        trophies.push(...currentTrophies);
        earnedTrophies.push(...currentEarnedTrophies);
    }

    return {trophies, earnedTrophies}
}