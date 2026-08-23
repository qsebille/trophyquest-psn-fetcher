import {PlayedSuite} from "../psn/played-suite";
import {computeTrophyQuestPlayerUuid, computeTrophyQuestSuiteUuid} from "../utils/uuid";

export interface TrophyQuestPlayedSuite {
    suiteId: string
    playerId: string
    lastPlayedAt: string
}

export function buildTrophyQuestPlayedSuites(accountId: string, playedSuites: PlayedSuite[]) {
    const playerId = computeTrophyQuestPlayerUuid(accountId)
    return playedSuites.map(t => {
        const trophySuiteId = computeTrophyQuestSuiteUuid(t.id)
        return {
            suiteId: trophySuiteId,
            playerId,
            lastPlayedAt: t.lastPlayedAt,
        } as TrophyQuestPlayedSuite
    });
}