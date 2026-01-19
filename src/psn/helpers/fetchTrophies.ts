import {AuthorizationPayload} from "psn-api";
import {UserPlayedTrophySuite} from "../../models/UserPlayedTrophySuite.js";
import {mapWithConcurrency} from "../../aws/utils/mapWithConcurrency.js";
import {fetchTrophiesForSuite} from "./fetchTrophiesForSuite.js";
import {Trophy} from "../../models/Trophy.js";
import {EarnedTrophy} from "../../models/EarnedTrophy.js";
import {fetchEarnedTrophiesForSuite} from "./fetchEarnedTrophiesForSuite.js";
import {fetchGroupsForSuite} from "./fetchGroupsForSuite.js";
import {TrophySuiteGroup} from "../../models/TrophySuiteGroup.js";
import {Player} from "../../models/Player.js";

export type TrophyDataResponse = {
    trophies: Trophy[];
    earnedTrophies: EarnedTrophy[];
    groups: TrophySuiteGroup[];
};

export async function fetchTrophies(
    auth: AuthorizationPayload,
    player: Player,
    trophySuites: UserPlayedTrophySuite[],
    concurrency: number,
): Promise<TrophyDataResponse> {
    const startTime = Date.now();
    const safeConcurrency = Math.max(1, concurrency);

    const accountId = player.id;
    const perSetResults: TrophyDataResponse[] = await mapWithConcurrency(
        trophySuites,
        safeConcurrency,
        async (playedTrophySuite): Promise<TrophyDataResponse> => {
            const [trophies, earnedTrophies, groups] = await Promise.all([
                fetchTrophiesForSuite(auth, playedTrophySuite.trophySuite),
                fetchEarnedTrophiesForSuite(auth, accountId, playedTrophySuite.trophySuite),
                fetchGroupsForSuite(auth, playedTrophySuite.trophySuite),
            ]);

            return {trophies, earnedTrophies, groups};
        }
    );

    const trophies = perSetResults.flatMap(r => r.trophies);
    const earnedTrophies = perSetResults.flatMap(r => r.earnedTrophies);
    const groups = perSetResults.flatMap(r => r.groups);

    const duration = (Date.now() - startTime) / 1000;
    console.info(`Fetched ${trophies.length} trophies, ${earnedTrophies.length} earned trophies and ${groups.length} groups in ${duration.toFixed(2)} s`);

    return {trophies, earnedTrophies, groups};
}