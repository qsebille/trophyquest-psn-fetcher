import {PsnTrophySet} from "../models/psnTrophySet.js";
import {PsnAuthTokens} from "../../auth/psnAuthTokens.js";
import {PsnEarnedTrophy} from "../models/psnEarnedTrophy.js";


/**
 * Fetches the trophies earned by a specified PlayStation Network (PSN) account for a given trophy set.
 *
 * @param {PsnTrophySet} psnTrophySet - The PSN trophy set containing details about the set of trophies for which earned trophies are being fetched.
 * @param {PsnAuthTokens} psnAuthTokens - The authentication tokens required to access the PSN API.
 * @param {string} accountId - The account ID of the PSN user for whom the earned trophies are being retrieved.
 * @return {Promise<PsnEarnedTrophy[]>} A promise that resolves to an array of earned trophy objects containing their IDs, the user ID, and the earned date and time.
 */
export async function fetchPsnEarnedTrophiesForSet(
    psnTrophySet: PsnTrophySet,
    psnAuthTokens: PsnAuthTokens,
    accountId: string
): Promise<PsnEarnedTrophy[]> {
    const {getUserTrophiesEarnedForTitle} = await import("psn-api");

    let options = {};
    if (psnTrophySet.platform !== "PS5") {
        options = {npServiceName: "trophy"};
    }
    const userTrophiesEarned = await getUserTrophiesEarnedForTitle(psnAuthTokens, accountId, psnTrophySet.id, "all", options);

    return userTrophiesEarned.trophies
        .filter(trophy => trophy.earnedDateTime !== undefined)
        .map(trophy => {
            return {
                trophyId: `${psnTrophySet.id}-${trophy.trophyId}`,
                userId: accountId,
                earnedDateTime: trophy.earnedDateTime,
            } as PsnEarnedTrophy
        });
}