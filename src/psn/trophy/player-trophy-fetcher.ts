import {AuthorizationPayload} from "psn-api";
import {mapWithConcurrency} from "../../utils/map-with-concurrency";
import {fetchTrophiesForSuite} from "./trophy-fetcher";
import {PlayedTrophySuite} from "../trophysuite/played-trophy-suite.model";
import {fetchEarnedTrophiesForSuite} from "./earned-trophy-fetcher";
import {fetchGroupsForSuite} from "./trophy-suite-group-fetcher";


export async function fetchPlayerTrophies(
    auth: AuthorizationPayload,
    accountId: string,
    trophySuites: PlayedTrophySuite[],
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