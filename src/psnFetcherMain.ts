import {getParams, Params} from "./config/params.js";
import {buildPostgresPool} from "./postgres/utils/buildPostgresPool.js";
import {Pool} from "pg";
import {getPsnAuthTokens, PsnAuthTokens} from "./auth/psnAuthTokens.js";
import {PsnUser} from "./psn/models/psnUser.js";
import {fetchPsnUser} from "./psn/fetchPsnUser.js";
import {PsnTitle} from "./psn/models/psnTitle.js";
import {fetchPsnTitles} from "./psn/fetchPsnTitles.js";
import {PsnTrophySet} from "./psn/models/psnTrophySet.js";
import {fetchPsnTrophySets} from "./psn/fetchPsnTrophySets.js";
import {fetchPsnTitlesTrophySet} from "./psn/fetchPsnTitlesTrophySet.js";
import {PsnTitleTrophySet} from "./psn/models/psnTitleTrophySet.js";
import {getTrophiesData, TrophyResponseDTO} from "./modules/psn-trophy.js";
import {insertEarnedTrophiesIntoPostgres, insertTrophiesIntoPostgres} from "./modules/postgres/insert-trophies.js";
import {insertTitlesIntoPostgres} from "./postgres/insertTitlesIntoPostgres.js";
import {insertUserTitlesIntoPostgres} from "./postgres/insertUserTitlesIntoPostgres.js";
import {insertTrophySetsIntoPostgres} from "./postgres/insertTrophySetsIntoPostgres.js";
import {insertTitlesTrophySetIntoPostgres} from "./postgres/insertTitlesTrophySetIntoPostgres.js";
import {insertUserIntoPostgres} from "./postgres/insertUserIntoPostgres.js";


async function main() {
    console.info("START PSN Fetcher v2")

    const params: Params = getParams();
    const pool: Pool = buildPostgresPool();

    try {
        // Authenticate and fetch user data
        const psnAuthTokens: PsnAuthTokens = await getPsnAuthTokens(params.npsso);
        const psnUser: PsnUser = await fetchPsnUser(psnAuthTokens, params.profileName);
        const accountId: string = psnUser.id;

        // Fetch titles and trophy sets for a user
        const titles: PsnTitle[] = await fetchPsnTitles(psnAuthTokens, accountId);
        console.info(`Found ${titles.length} titles`);
        const trophySets: PsnTrophySet[] = await fetchPsnTrophySets(psnAuthTokens, accountId);
        console.info(`Found ${trophySets.length} trophy sets`);
        const titleTrophySets: PsnTitleTrophySet[] = await fetchPsnTitlesTrophySet(titles, trophySets, psnAuthTokens, accountId);
        console.info(`Found ${titleTrophySets} titles / trophy sets links`)

        // Fetch trophies for each title
        const trophyResponseDTO: TrophyResponseDTO = await getTrophiesData(psnAuthTokens, accountId, trophySets);
        console.info(`Found ${trophyResponseDTO.trophies.length} trophies`);
        console.info(`Found ${trophyResponseDTO.earnedTrophies.length} earned trophies`);

        // Insertion into postgres database
        await insertUserIntoPostgres(pool, psnUser);
        await insertTitlesIntoPostgres(pool, titles);
        await insertUserTitlesIntoPostgres(pool, psnUser, titles);
        await insertTrophySetsIntoPostgres(pool, trophySets);
        await insertTitlesTrophySetIntoPostgres(pool, titleTrophySets);
        await insertTrophiesIntoPostgres(pool, trophyResponseDTO.trophies);
        await insertEarnedTrophiesIntoPostgres(pool, trophyResponseDTO.earnedTrophies);

        console.info("SUCCESS");
    } finally {
        await pool.end();
    }
}

main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
});
