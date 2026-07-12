import {PlayedTrophySuite} from "../psn/trophysuite/played-trophy-suite.model";
import {computeTrophyQuestPlayerUuid, computeTrophyQuestTrophySuiteUuid} from "../utils/uuid";

export interface TrophyQuestPlayedTrophySuite {
    trophySuiteId: string
    playerId: string
    lastPlayedAt: string
}

export function buildTrophyQuestPlayedTrophySuites(accountId: string, playedTrophySuites: PlayedTrophySuite[]) {
    const playerId = computeTrophyQuestPlayerUuid(accountId)
    return playedTrophySuites.map(t => {
        const trophySuiteId = computeTrophyQuestTrophySuiteUuid(t.id)
        return {
            trophySuiteId,
            playerId,
            lastPlayedAt: t.lastPlayedAt,
        } as TrophyQuestPlayedTrophySuite
    });
}