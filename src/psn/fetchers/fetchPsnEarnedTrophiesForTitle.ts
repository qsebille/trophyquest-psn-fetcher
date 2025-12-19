import {PsnTitle} from "../models/psnTitle.js";
import {PsnAuthTokens} from "../../auth/psnAuthTokens.js";
import {PsnEarnedTrophy} from "../models/psnEarnedTrophy.js";


export async function fetchPsnEarnedTrophiesForTitle(
    psnTitle: PsnTitle,
    psnAuthTokens: PsnAuthTokens,
    accountId: string
): Promise<PsnEarnedTrophy[]> {
    const {getUserTrophiesEarnedForTitle} = await import("psn-api");

    let options = {};
    if (psnTitle.platform !== "PS5") {
        options = {npServiceName: "trophy"};
    }
    const userTrophiesEarned = await getUserTrophiesEarnedForTitle(psnAuthTokens, accountId, psnTitle.id, "all", options);

    return userTrophiesEarned.trophies
        .filter(trophy => trophy.earnedDateTime !== undefined)
        .map(trophy => {
            return {
                trophyId: `${psnTitle.id}-${trophy.trophyId}`,
                trophyRank: trophy.trophyId,
                userId: accountId,
                earnedDateTime: trophy.earnedDateTime,
            } as PsnEarnedTrophy
        });
}