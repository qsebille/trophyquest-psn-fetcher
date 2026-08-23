import {computeTrophyQuestGameUuid, computeTrophyQuestSuiteUuid} from "../utils/uuid";
import {PlayedSuite} from "../psn/played-suite";

export interface TrophyQuestSuite {
    id: string
    gameId: string | null
    name: string
    psnIconUrl: string
    platforms: string[]
}

export function buildTrophyQuestSuites(trophySuites: PlayedSuite[]) {
    return trophySuites.map(t => {
        const trophySuiteId = computeTrophyQuestSuiteUuid(t.id)

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
        } as TrophyQuestSuite
    })
}