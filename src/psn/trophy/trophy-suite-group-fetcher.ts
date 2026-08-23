import {AuthorizationPayload} from "psn-api";
import {TrophySuiteGroup} from "./trophy-suite-group.model";
import {PlayedSuite} from "../played-suite";
import {buildTrophySuiteGroupUniqueId} from "./trophy-suite-group-id-builder";

export async function fetchGroupsForSuite(
    auth: AuthorizationPayload,
    trophySuite: PlayedSuite,
) {
    const {getTitleTrophyGroups} = await import("psn-api");

    const options = {npServiceName: trophySuite.npServiceName};
    const groupResponse = await getTitleTrophyGroups(auth, trophySuite.id, options);

    return groupResponse.trophyGroups.map(g => {
        const trophySuiteGroupId = buildTrophySuiteGroupUniqueId(trophySuite.id, g.trophyGroupId)
        return {
            id: trophySuiteGroupId,
            trophySuiteId: trophySuite.id,
            psnId: g.trophyGroupId,
            name: g.trophyGroupName
        } as TrophySuiteGroup;
    });
}