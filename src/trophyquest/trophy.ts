import {Trophy} from "../psn/trophy/trophy.model";
import {computeTrophyQuestGroupUuid, computeTrophyQuestSuiteUuid, computeTrophyQuestTrophyUuid} from "../utils/uuid";

export interface TrophyQuestTrophy {
    id: string
    rank: number
    title: string
    description: string
    color: string
    isHidden: boolean
    psnIconUrl: string
    suiteId: string
    groupId: string
}

export function buildTrophyQuestTrophies(trophies: Trophy[]) {
    return trophies.map(t => {
        const trophyId = computeTrophyQuestTrophyUuid(t.id)
        const suiteId = computeTrophyQuestSuiteUuid(t.trophySuiteId)
        const groupId = computeTrophyQuestGroupUuid(t.groupId)
        return {
            id: trophyId,
            rank: t.rank,
            title: t.title,
            description: t.detail,
            color: t.color,
            isHidden: t.isHidden,
            psnIconUrl: t.iconUrl,
            suiteId: suiteId,
            groupId: groupId,
        } as TrophyQuestTrophy
    })
}