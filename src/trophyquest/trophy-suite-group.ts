import {TrophySuiteGroup} from "../psn/trophy/trophy-suite-group.model";
import {computeTrophyQuestTrophySuiteGroupUuid, computeTrophyQuestTrophySuiteUuid} from "../utils/uuid";

export interface TrophyQuestTrophySuiteGroup {
    id: string
    psnId: string,
    name: string
    trophySuiteId: string
}

export function buildTrophyQuestTrophySuiteGroups(trophySuiteGroups: TrophySuiteGroup[]) {
    return trophySuiteGroups.map(g => {
        const trophySuiteGroupId = computeTrophyQuestTrophySuiteGroupUuid(g.id)
        const trophySuiteId = computeTrophyQuestTrophySuiteUuid(g.trophySuiteId)
        return {
            id: trophySuiteGroupId,
            psnId: g.psnId,
            name: g.name,
            trophySuiteId
        } as TrophyQuestTrophySuiteGroup
    });
}