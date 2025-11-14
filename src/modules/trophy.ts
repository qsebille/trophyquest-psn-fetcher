import {Auth} from "./auth.js";
import {GameTQ} from "./game.js";
import {trophyUuid} from "./uuid.js";

export type TrophyPsn = {
    trophyId: number;
    trophyHidden: boolean;
    trophyType: string;
    trophyName: string;
    trophyDetail: string;
    trophyIconUrl: string;
    trophyGroupId: string;
}

export type TrophyEarnedPsn = {
    trophyId: number;
    trophyHidden: boolean;
    earned: boolean;
    earnedDateTime: string;
    trophyType: string;
    trophyRare: number;
    trophyEarnedRate: string;
}


async function fetchPsnGameTrophies(auth: Auth, gameId: string, platform: string) {
    //@ts-ignore
    const {getTitleTrophies} = await import("psn-api");
    switch (platform) {
        case "PS5":
            return getTitleTrophies(auth, gameId, "all");
        default:
            return await getTitleTrophies(auth, gameId, "all", {npServiceName: "trophy"});
    }
}

export async function listGameTrophies(
    auth: Auth,
    game: GameTQ
): Promise<TrophyPsn[]> {
    const result = await fetchPsnGameTrophies(auth, game.psnId, game.platform);
    return result.trophies;
}


async function fetchPsnEarnedGameTrophies(auth: Auth, gameId: string, accountId: string, platform: string) {
    //@ts-ignore
    const {getUserTrophiesEarnedForTitle} = await import("psn-api");
    switch (platform) {
        case "PS5":
            return await getUserTrophiesEarnedForTitle(auth, accountId, gameId, "all");
        default:
            return await getUserTrophiesEarnedForTitle(auth, accountId, gameId, "all", {npServiceName: "trophy"});
    }
}

export async function listEarnedGameTrophies(
    auth: Auth,
    game: GameTQ,
    accountId: string = "me",
): Promise<Map<number, TrophyEarnedPsn>> {
    const psnEarnedTrophies = await fetchPsnEarnedGameTrophies(auth, game.psnId, accountId, game.platform);
    const map = new Map<number, any>();
    for (const e of psnEarnedTrophies.trophies) map.set(e.trophyId, e);
    return map;
}

export type TrophyTQ = {
    id: string;
    gameId: string;
    orderInGame: number;
    title: string;
    detail: string;
    trophyType: string;
    iconUrl: string;
    groupId: string;
    isHidden: boolean;
    earnedDateTime: string | null;
}

export function toTrophyTQ(trophyPsn: TrophyPsn, game: GameTQ, earnedMap: Map<number, TrophyEarnedPsn>): TrophyTQ {
    const trophyId = trophyUuid(game.id, trophyPsn.trophyId);
    const earnedDateTime = earnedMap.get(trophyPsn.trophyId)?.earnedDateTime ?? null;
    return {
        id: trophyId,
        gameId: game.id,
        orderInGame: trophyPsn.trophyId,
        title: trophyPsn.trophyName,
        detail: trophyPsn.trophyDetail,
        trophyType: trophyPsn.trophyType,
        iconUrl: trophyPsn.trophyIconUrl,
        groupId: trophyPsn.trophyGroupId,
        isHidden: trophyPsn.trophyHidden,
        earnedDateTime: earnedDateTime
    }
}