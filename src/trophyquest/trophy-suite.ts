import {computeTrophyQuestGameUuid, computeTrophyQuestTrophySuiteUuid} from "../utils/uuid";
import {PlayedTrophySuite} from "../psn/trophysuite/played-trophy-suite.model";

export interface TrophyQuestTrophySuite {
    id: string
    gameId: string | null
    name: string
    psnIconUrl: string
    platforms: string[]
}

export function buildTrophyQuestTrophySuites(trophySuites: PlayedTrophySuite[]) {
    return trophySuites.map(t => {
        const trophySuiteId = computeTrophyQuestTrophySuiteUuid(t.id)

        let gameId: string | null = null;
        if (t.gameId) {
            gameId = computeTrophyQuestGameUuid(t.gameId)
        }
        return {
            id: trophySuiteId,
            gameId: gameId,
            name: t.name,
            psnIconUrl: t.iconUrl,
            platforms: t.platforms
        } as TrophyQuestTrophySuite
    })
}