import {AuthorizationPayload} from "psn-api";
import {mapWithConcurrency} from "../../utils/map-with-concurrency";
import {fetchTrophiesForSuite} from "./trophy-fetcher";
import {fetchEarnedTrophiesForSuite} from "./earned-trophy-fetcher";
import {fetchGroupsForSuite} from "./trophy-suite-group-fetcher";
import {PlayedSuite} from "../played-suite";


export async function fetchPlayerTrophies(
    auth: AuthorizationPayload,
    accountId: string,
    trophySuites: PlayedSuite[],
) {
    const batchResults = await mapWithConcurrency(
        trophySuites,
        5,
        async (playedTrophySuite) => {
            const [trophies, earnedTrophies, groups] = await Promise.all([
                fetchTrophiesForSuite(auth, playedTrophySuite),
                fetchEarnedTrophiesForSuite(auth, accountId, playedTrophySuite),
                fetchGroupsForSuite(auth, playedTrophySuite),
            ]);

            return {trophies, earnedTrophies, groups};
        }
    );

    const trophies = batchResults.flatMap(r => r.trophies);
    const earnedTrophies = batchResults.flatMap(r => r.earnedTrophies);
    const groups = batchResults.flatMap(r => r.groups);

    return {trophies, earnedTrophies, groups};
}