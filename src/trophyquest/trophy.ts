import {Trophy} from "../psn/trophy/trophy.model";
import {
    computeTrophyQuestTrophySuiteGroupUuid,
    computeTrophyQuestTrophySuiteUuid,
    computeTrophyQuestTrophyUuid
} from "../utils/uuid";

export interface TrophyQuestTrophy {
    id: string
    rank: number
    title: string
    description: string
    color: string
    isHidden: boolean
    psnIconUrl: string
    trophySuiteId: string
    trophySuiteGroupId: string
}

export function buildTrophyQuestTrophies(trophies: Trophy[]) {
    return trophies.map(t => {
        const trophyId = computeTrophyQuestTrophyUuid(t.id)
        const trophySuiteId = computeTrophyQuestTrophySuiteUuid(t.trophySuiteId)
        const trophySuiteGroupId = computeTrophyQuestTrophySuiteGroupUuid(t.groupId)
        return {
            id: trophyId,
            rank: t.rank,
            title: t.title,
            description: t.detail,
            color: t.color,
            isHidden: t.isHidden,
            psnIconUrl: t.iconUrl,
            trophySuiteId: trophySuiteId,
            trophySuiteGroupId: trophySuiteGroupId,
        } as TrophyQuestTrophy
    })
}