import {AuthorizationPayload} from "psn-api";
import {buildTrophyId} from "./trophy-id-builder";
import {buildTrophySuiteGroupUniqueId} from "./trophy-suite-group-id-builder";
import {Trophy} from "./trophy.model";
import {PlayedSuite} from "../played-suite";

export async function fetchTrophiesForSuite(
    auth: AuthorizationPayload,
    trophySuite: PlayedSuite,
): Promise<Trophy[]> {
    const {getTitleTrophies} = await import("psn-api");

    const options = {npServiceName: trophySuite.npServiceName};
    const titleTrophies = await getTitleTrophies(auth, trophySuite.id, "all", options);

    return titleTrophies.trophies.map(trophy => {
        const rank = trophy.trophyId;
        return {
            id: buildTrophyId(trophySuite.id, rank),
            trophySuiteId: trophySuite.id,
            groupId: buildTrophySuiteGroupUniqueId(trophySuite.id, trophy.trophyGroupId ?? 'default'),
            rank: rank,
            title: trophy.trophyName ?? '',
            detail: trophy.trophyDetail ?? '',
            isHidden: trophy.trophyHidden,
            color: trophy.trophyType,
            iconUrl: trophy.trophyIconUrl ?? '',
        }
    });
}