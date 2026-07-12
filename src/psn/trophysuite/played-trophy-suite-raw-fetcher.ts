import {AuthorizationPayload, TrophyTitle} from "psn-api";
import {PlayedTrophySuite} from "./played-trophy-suite.model";

const BATCH_SIZE = 200


export async function fetchRawPlayedTrophySuites(
    auth: AuthorizationPayload,
    accountId: string,
) {
    const {getUserTitles} = await import("psn-api");

    const result = []

    let offset = 0;
    while (true) {
        const options = {limit: BATCH_SIZE, offset};
        const response = await getUserTitles(auth, accountId, options);

        // Adding trophy suites to the result
        const playedTrophyTitles = response.trophyTitles
            .map(trophyTitle => toPlayedTrophySuite(trophyTitle))
        result.push(...playedTrophyTitles);

        // End of loop
        if (response.nextOffset === undefined || response.nextOffset === null) break;
        offset = response.nextOffset;
    }

    return result;
}

function toPlayedTrophySuite(trophyTitle: TrophyTitle) {
    return {
        id: trophyTitle.npCommunicationId,
        name: trophyTitle.trophyTitleName,
        iconUrl: trophyTitle.trophyTitleIconUrl,
        platforms: trophyTitle.trophyTitlePlatform.split(','),
        hasTrophyGroups: trophyTitle.hasTrophyGroups,
        npServiceName: trophyTitle.npServiceName,
        lastPlayedAt: trophyTitle.lastUpdatedDateTime,
    } as PlayedTrophySuite
}