import {EarnedTrophy} from "../psn/trophy/earned-trophy.model";
import {computeTrophyQuestPlayerUuid, computeTrophyQuestTrophyUuid} from "../utils/uuid";

export interface TrophyQuestEarnedTrophy {
    trophyId: string
    playerId: string
    earnedAt: string
}

export function buildTrophyQuestEarnedTrophies(
    accountId: string,
    earnedTrophies: EarnedTrophy[]
) {
    const playerId = computeTrophyQuestPlayerUuid(accountId)

    return earnedTrophies.map(t => {
        const trophyId = computeTrophyQuestTrophyUuid(t.trophyId)
        return {
            trophyId,
            playerId,
            earnedAt: t.earnedAt,
        } as TrophyQuestEarnedTrophy
    });
}