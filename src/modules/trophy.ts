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

export async function listGameTrophies(
    auth: Auth,
    game: GameTQ
): Promise<TrophyPsn[]> {
    //@ts-ignore
    const {getTitleTrophies} = await import("psn-api");
    const platforms: string[] = game.platform.split(",");
    if (platforms.filter(p => p === 'PS5').length === 1) {
        const result = await getTitleTrophies(auth, game.psnId, "all");
        return result.trophies;
    } else {
        const result = await getTitleTrophies(auth, game.psnId, "all", {npServiceName: "trophy"});
        return result.trophies;
    }
}

export async function listEarnedGameTrophies(
    auth: Auth,
    game: GameTQ,
    accountId: string = "me",
): Promise<Map<number, TrophyEarnedPsn>> {
    //@ts-ignore
    const {getUserTrophiesEarnedForTitle} = await import("psn-api");
    const platforms: string[] = game.platform.split(",");
    if (platforms.filter(p => p === 'PS5').length === 1) {
        const result = await getUserTrophiesEarnedForTitle(auth, accountId, game.psnId, "all");
        const map = new Map<number, any>();
        for (const e of result.trophies) map.set(e.trophyId, e);
        return map;
    } else {
        const result = await getUserTrophiesEarnedForTitle(auth, accountId, game.psnId, "all", {npServiceName: "trophy"});
        const map = new Map<number, any>();
        for (const e of result.trophies) map.set(e.trophyId, e);
        return map;
    }
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