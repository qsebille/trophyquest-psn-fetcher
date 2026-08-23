import {TrophySuiteGroup} from "../psn/trophy/trophy-suite-group.model";
import {computeTrophyQuestGroupUuid, computeTrophyQuestSuiteUuid} from "../utils/uuid";

export interface TrophyQuestGroup {
    id: string
    psnId: string,
    name: string
    suiteId: string
}

export function buildTrophyQuestGroups(trophySuiteGroups: TrophySuiteGroup[]) {
    return trophySuiteGroups.map(g => {
        const groupId = computeTrophyQuestGroupUuid(g.id)
        const suiteId = computeTrophyQuestSuiteUuid(g.trophySuiteId)
        return {
            id: groupId,
            psnId: g.psnId,
            name: g.name,
            suiteId: suiteId
        } as TrophyQuestGroup
    });
}