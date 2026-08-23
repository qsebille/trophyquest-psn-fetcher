import {AuthorizationPayload} from "psn-api";
import {EarnedTrophy} from "./earned-trophy.model";
import {buildTrophyId} from "./trophy-id-builder";
import {PlayedSuite} from "../played-suite";

export async function fetchEarnedTrophiesForSuite(
    auth: AuthorizationPayload,
    accountId: string,
    trophySuite: PlayedSuite,
): Promise<EarnedTrophy[]> {
    const {getUserTrophiesEarnedForTitle} = await import("psn-api");

    let options = {npServiceName: trophySuite.npServiceName};
    const userTrophiesEarned = await getUserTrophiesEarnedForTitle(auth, accountId, trophySuite.id, "all", options);

    return userTrophiesEarned.trophies
        .filter(trophy => trophy.earnedDateTime !== undefined)
        .map(trophy => {
            const rank = trophy.trophyId;
            return {
                trophyId: buildTrophyId(trophySuite.id, rank),
                trophyRank: rank,
                playerId: accountId,
                earnedAt: trophy.earnedDateTime ?? '',
            }
        });
}