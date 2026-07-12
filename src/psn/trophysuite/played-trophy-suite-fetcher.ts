import {AuthorizationPayload} from "psn-api";
import {enrichPlayedTrophySuiteWithGameId} from "./played-trophy-suite-enricher";
import {fetchRawPlayedTrophySuites} from "./played-trophy-suite-raw-fetcher";
import {PlayedGame} from "../game/played-game.model";


export async function fetchPlayedTrophySuites(
    auth: AuthorizationPayload,
    accountId: string,
    playedGames: PlayedGame[],
    concurrency: number = 10
) {
    const playedSuites = await fetchRawPlayedTrophySuites(auth, accountId);
    console.info(`Fetched ${playedSuites.length} raw trophy suites`)
    const enrichedPlayedSuites = await enrichPlayedTrophySuiteWithGameId(auth, accountId, playedGames, playedSuites, concurrency);
    const suitesWithNoGame = enrichedPlayedSuites.filter(playedTrophySuite => !playedTrophySuite.gameId);

    if (suitesWithNoGame.length > 0) {
        console.warn(`⚠️ No game found for ${suitesWithNoGame.length} trophy suites`)
    } else {
        console.info("All trophy suites have a game")
    }

    return enrichedPlayedSuites
}