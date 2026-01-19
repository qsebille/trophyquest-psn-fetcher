import {AuthorizationPayload, UserTitlesResponse} from "psn-api";
import {UserPlayedTrophySuite} from "../../models/UserPlayedTrophySuite.js";
import {Player} from "../../models/Player.js";

const PSN_TITLE_BATCH_SIZE: number = 200

export async function fetchTrophySuites(
    auth: AuthorizationPayload,
    player: Player,
): Promise<UserPlayedTrophySuite[]> {
    const {getUserTitles} = await import("psn-api");

    const startTime = Date.now();

    const accountId = player.id;
    let offset = 0;
    const result: UserPlayedTrophySuite[] = [];
    while (true) {
        const options = {limit: PSN_TITLE_BATCH_SIZE, offset};
        const userTitlesResponse: UserTitlesResponse = await getUserTitles(auth, accountId, options);
        const batchTrophySuites = userTitlesResponse.trophyTitles
            .map(trophyTitle => {
                return {
                    trophySuite: {
                        id: trophyTitle.npCommunicationId,
                        name: trophyTitle.trophyTitleName,
                        version: trophyTitle.trophySetVersion,
                        iconUrl: trophyTitle.trophyTitleIconUrl,
                        platforms: trophyTitle.trophyTitlePlatform,
                        hasTrophyGroups: trophyTitle.hasTrophyGroups,
                        npServiceName: trophyTitle.npServiceName,
                    },
                    playerId: player.id,
                    lastPlayedAt: trophyTitle.lastUpdatedDateTime,
                }
            });
        result.push(...batchTrophySuites);
        if (userTitlesResponse.nextOffset === undefined || userTitlesResponse.nextOffset === null) break;
        offset = userTitlesResponse.nextOffset;
    }

    const duration = (Date.now() - startTime) / 1000;
    console.info(`Fetched ${result.length} trophy suites in ${duration.toFixed(2)} s`);

    return result;
}