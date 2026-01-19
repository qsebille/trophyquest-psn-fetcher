import {buildPostgresPool} from "./postgres/utils/buildPostgresPool.js";
import {Pool} from "pg";
import {getAuthorizationPayload} from "./auth/psnAuthTokens.js";
import {getMandatoryParam} from "./config/getMandatoryParam.js";
import {AuthorizationPayload} from "psn-api";
import {getUserProfile} from "./psn/helpers/getUserProfile.js";
import {Player} from "./models/Player.js";
import {fetchUserGamesAndEditions} from "./psn/helpers/fetchUserGamesAndEditions.js";
import {fetchEditionTrophySuiteLinks} from "./psn/helpers/fetchEditionTrophySuiteLinks.js";
import {fetchTrophySuites} from "./psn/helpers/fetchTrophySuites.js";
import {fetchTrophies} from "./psn/helpers/fetchTrophies.js";
import {insertIntoTrophyQuestDatabase} from "./postgres/insertIntoTrophyQuestDatabase.js";


async function runFetcher(): Promise<void> {
    const startTime = Date.now();
    console.info("Start PSN Fetcher function");

    const npsso: string = getMandatoryParam('NPSSO');
    const profileName: string = getMandatoryParam('PROFILE_NAME');
    const concurrency: number = Number(getMandatoryParam('CONCURRENCY'));
    const pool: Pool = buildPostgresPool();
    console.info(`Fetching PSN data for profile ${profileName}`);

    try {
        // Auth + user info
        const auth: AuthorizationPayload = await getAuthorizationPayload(npsso);
        const player: Player = await getUserProfile(auth, profileName);

        // Fetch data from PSN API
        const playedGamesAndEditions = await fetchUserGamesAndEditions(auth, player);
        const editionTrophySuiteLinks = await fetchEditionTrophySuiteLinks(auth, player, playedGamesAndEditions.editions)
        const playedTrophySuites = await fetchTrophySuites(auth, player);
        const userTrophyData = await fetchTrophies(auth, player, playedTrophySuites, concurrency);

        // Insert data into database
        await insertIntoTrophyQuestDatabase(
            pool,
            [player],
            playedGamesAndEditions.games,
            playedGamesAndEditions.editions,
            playedTrophySuites,
            editionTrophySuiteLinks,
            userTrophyData.groups,
            userTrophyData.trophies,
            userTrophyData.earnedTrophies
        )

        console.info("PSN Fetcher : Success");
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
