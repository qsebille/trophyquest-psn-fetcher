import {PsnTrophySet} from "../models/psnTrophySet.js";
import {PsnAuthTokens} from "../../auth/psnAuthTokens.js";
import {PsnTrophy} from "../models/psnTrophy.js";

/**
 * Fetches PlayStation Network (PSN) trophies for a given trophy set.
 *
 * @param {PsnTrophySet} psnTrophySet - The PSN trophy set for which to fetch trophies. Contains information about the trophy set including its id and platform type.
 * @param {PsnAuthTokens} psnAuthTokens - Authentication tokens required to access the PSN API.
 * @return {Promise<PsnTrophy[]>} A promise that resolves with an array of trophies belonging to the specified trophy set, including details such as id, rank, title, and type.
 */
export async function fetchPsnTrophiesForSet(
    psnTrophySet: PsnTrophySet,
    psnAuthTokens: PsnAuthTokens
): Promise<PsnTrophy[]> {
    const {getTitleTrophies} = await import("psn-api");

    let options = {};
    if (psnTrophySet.platform !== "PS5") {
        options = {npServiceName: "trophy"};
    }
    const titleTrophies = await getTitleTrophies(psnAuthTokens, psnTrophySet.id, "all", options);

    return titleTrophies.trophies.map(trophy => {
        return {
            id: `${psnTrophySet.id}-${trophy.trophyId}`,
            rank: trophy.trophyId,
            title: trophy.trophyName,
            detail: trophy.trophyDetail,
            trophySetId: psnTrophySet.id,
            isHidden: trophy.trophyHidden,
            trophyType: trophy.trophyType,
            iconUrl: trophy.trophyIconUrl,
            groupId: trophy.trophyGroupId,
        } as PsnTrophy;
    });
}