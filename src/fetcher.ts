import {buildPostgresPool} from "./postgres/utils/build-postgres-pool.js";
import {Pool} from "pg";
import {getAuthorizationPayload} from "./psn/auth";
import {getMandatoryParam} from "./config/get-mandatory-param.js";
import {AuthorizationPayload} from "psn-api";
import {fetchPlayer} from "./psn/player/player-fetcher";
import {Player} from "./psn/player/player.model";
import {fetchPlayedGames} from "./psn/game/played-game-fetcher";
import {fetchPlayedTrophySuites} from "./psn/trophysuite/played-trophy-suite-fetcher";
import {fetchPlayerTrophies} from "./psn/trophy/player-trophy-fetcher";
import {buildTrophyquestPlayerData} from "./trophyquest/trophyquest-data";
import {insertTrophyQuestData} from "./postgres/trophyquest-app-insert";


async function runFetcher(): Promise<void> {
    const startTime = Date.now();
    console.info("🟢 PSN Fetcher: Start");

    const npsso: string = getMandatoryParam('NPSSO');
    const profileName: string = getMandatoryParam('PROFILE_NAME');
    const concurrency: number = Number(getMandatoryParam('CONCURRENCY'));
    const pool: Pool = buildPostgresPool();
    console.info(`Fetching all PSN data for profile ${profileName}`);

    try {
        // TODO: ajouter des calcul de temps et logger à la fin
        // Authenticate and fetch user info
        const auth: AuthorizationPayload = await getAuthorizationPayload(npsso);
        const player: Player = await fetchPlayer(auth, profileName);
        const accountId: string = player.id;
        console.info(`Fetched player data for profile ${profileName} with id ${accountId}`);

        // Fetching games
        const playedGames = await fetchPlayedGames(auth, accountId);
        console.info(`Fetched ${playedGames.length} games`)

        // Fetching trophy suites
        const playedSuites = await fetchPlayedTrophySuites(auth, accountId, playedGames);
        console.info(`Fetched ${playedSuites.length} trophy suites`)

        // Fetching trophies and earned trophies
        const trophyData = await fetchPlayerTrophies(auth, accountId, playedSuites);
        console.info(`Fetched ${trophyData.trophies.length} trophies`)
        console.info(`Fetched ${trophyData.earnedTrophies.length} earned trophies`)
        console.info(`Fetched ${trophyData.groups.length} trophy groups`)

        // Building Trophyquest data
        const tqData = buildTrophyquestPlayerData(accountId, [player], playedGames, playedSuites, trophyData.trophies, trophyData.earnedTrophies, trophyData.groups);
        console.info(`Built TrophyQuest data for profile ${profileName}`);
        console.info(`Built ${tqData.games.length} games`);
        console.info(`Built ${tqData.trophySuites.length} suites`);
        console.info(`Built ${tqData.trophySuiteGroups.length} suite groups`);
        console.info(`Built ${tqData.trophies.length} trophies`);
        console.info(`Built ${tqData.playedGames.length} played games`);
        console.info(`Built ${tqData.playedTrophySuites.length} played suites`);
        console.info(`Built ${tqData.earnedTrophies.length} earned trophies`);

        // Inserting data into database
        await insertTrophyQuestData(pool, tqData)

        console.info("✅ PSN Fetcher : Success");
    } finally {
        const durationSeconds = (Date.now() - startTime) / 1000;
        console.info(`Total processing time: ${durationSeconds.toFixed(2)} s`);
        await pool.end();
    }
}

export const handler = async (
    event: any = {},
    _context: any = {}
): Promise<void> => {
    if (event.profileName) {
        process.env.PROFILE_NAME = event.profileName;
    }
    await runFetcher();
};

if (!process.env.LAMBDA_TASK_ROOT) {
    runFetcher().catch((e) => {
        console.error(e);
        process.exitCode = 1;
    });
}
