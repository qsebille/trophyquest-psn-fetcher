import {Auth} from "./auth.js";
import {gameUuid} from "./uuid.js";

export async function listUserGamesPsn(auth: Auth, account: "me" | string): Promise<GamePsn[]> {
    const limit = 800;
    let offset = 0;
    const all: any[] = [];
    // @ts-ignore
    const {getUserTitles} = await import("psn-api");
    while (true) {
        const page = await getUserTitles(auth, account, {limit, offset});
        all.push(...page.trophyTitles);
        if (!page.nextOffset) break;
        offset = page.nextOffset;
    }
    return all;
}

export type GamePsn = {
    npServiceName: string;
    npCommunicationId: string;
    trophySetVersion: string;
    trophyTitleName: string;
    trophyTitleIconUrl: string;
    trophyTitlePlatform: string;
    hasTrophyGroups: boolean;
    trophyGroupCount: number;
    definedTrophies: {
        bronze: number;
        silver: number;
        gold: number;
        platinum: number;
    }
    progress: number;
    earnedTrophies: {
        bronze: number;
        silver: number;
        gold: number;
        platinum: number;
    }
    hiddenFlag: boolean;
    lastUpdatedDateTime: string;
}

export type GameTQ = {
    id: string;
    psnId: string;
    title: string;
    iconUrl: string;
    platform: string;
    lastUpdatedDateTime: string;
}

export function toTrophyQuestGame(gamePsn: GamePsn): GameTQ {
    return {
        id: gameUuid(gamePsn.trophyTitleName, gamePsn.trophyTitlePlatform),
        psnId: gamePsn.npCommunicationId,
        title: gamePsn.trophyTitleName,
        iconUrl: gamePsn.trophyTitleIconUrl,
        platform: gamePsn.trophyTitlePlatform,
        lastUpdatedDateTime: gamePsn.lastUpdatedDateTime
    }
}