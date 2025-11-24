import {PsnAuthTokens} from "../auth/psnAuthTokens.js";
import {PsnTrophySet} from "../psn/models/psnTrophySet.js";

export type TrophyDTO = {
    id: string;
    trophySetId: string;
    rank: number;
    title: string;
    detail: string;
    isHidden: boolean;
    trophyType: string;
    iconUrl: string;
    groupId: string;
}

export type EarnedTrophyDTO = {
    trophyId: string;
    userId: string;
    earnedDateTime: string;
}

export type TrophyResponseDTO = {
    trophies: TrophyDTO[];
    earnedTrophies: EarnedTrophyDTO[];
}

export async function getTrophiesData(
    psnAuthTokens: PsnAuthTokens,
    accountId: string,
    trophySets: PsnTrophySet[],
): Promise<TrophyResponseDTO> {
    let trophies: TrophyDTO[] = [];
    let earnedTrophies: EarnedTrophyDTO[] = [];

    for (const trophySet of trophySets) {
        console.info(`--- Processing trophies of ${trophySet.name} (${trophySet.id})`)
        const gameTrophyResponse = await fetchPsnGameTrophies(psnAuthTokens, trophySet.id, trophySet.platform);
        //@ts-ignore
        const currentTrophies: TrophyDTO[] = gameTrophyResponse.trophies.map(trophy => {
            return {
                id: `${trophySet.id}-${trophy.trophyId}`,
                rank: trophy.trophyId,
                title: trophy.trophyName,
                detail: trophy.trophyDetail,
                trophySetId: trophySet.id,
                isHidden: trophy.trophyHidden,
                trophyType: trophy.trophyType,
                iconUrl: trophy.trophyIconUrl,
                groupId: trophy.trophyGroupId,
            }
        });

        const earnedTrophyResponse = await fetchPsnEarnedGameTrophies(psnAuthTokens, accountId, trophySet.id, trophySet.platform);
        const currentEarnedTrophies: EarnedTrophyDTO[] = earnedTrophyResponse.trophies
            // @ts-ignore
            .filter(trophy => trophy.earnedDateTime !== undefined)
            // @ts-ignore
            .map(trophy => {
                return {
                    trophyId: `${trophySet.id}-${trophy.trophyId}`,
                    userId: accountId,
                    earnedDateTime: trophy.earnedDateTime,
                }
            });

        trophies.push(...currentTrophies);
        earnedTrophies.push(...currentEarnedTrophies);
    }

    return {trophies, earnedTrophies}
}

async function fetchPsnGameTrophies(psnAuthTokens: PsnAuthTokens, npCommunicationId: string, platform: string) {
    //@ts-ignore
    const {getTitleTrophies} = await import("psn-api");
    switch (platform) {
        case "PS5":
            return getTitleTrophies(psnAuthTokens, npCommunicationId, "all");
        default:
            return await getTitleTrophies(psnAuthTokens, npCommunicationId, "all", {npServiceName: "trophy"});
    }
}

async function fetchPsnEarnedGameTrophies(psnAuthTokens: PsnAuthTokens,
                                          accountId: string, npCommunicationId: string,
                                          platform: string) {
    //@ts-ignore
    const {getUserTrophiesEarnedForTitle} = await import("psn-api");
    switch (platform) {
        case "PS5":
            return await getUserTrophiesEarnedForTitle(psnAuthTokens, accountId, npCommunicationId, "all");
        default:
            return await getUserTrophiesEarnedForTitle(psnAuthTokens, accountId, npCommunicationId, "all", {npServiceName: "trophy"});
    }
}