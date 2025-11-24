import {getParams, Params} from "./config/params.js";
import {getTitlesData, PsnTitlesTrophySetResponseDTO} from "./modules/psn-titles-trophy-sets.js";
import {insertUserIntoPostgres} from "./modules/postgres/insert-user.js";
import {insertTitlesIntoPostgres, insertUserTitlesIntoPostgres} from "./modules/postgres/insert-titles.js";
import {
    insertTitlesTrophySetIntoPostgres,
    insertTrophySetsIntoPostgres
} from "./modules/postgres/insert-trophy-sets.js";
import {getTrophiesData, TrophyResponseDTO} from "./modules/psn-trophy.js";
import {insertEarnedTrophiesIntoPostgres, insertTrophiesIntoPostgres} from "./modules/postgres/insert-trophies.js";
import {buildPostgresPool} from "./postgres/postgres-pool.js";
import {Pool} from "pg";
import {getPsnAuthTokens, PsnAuthTokens} from "./auth/psnAuthTokens.js";
import {PsnUserDto} from "./psn/models/psnUserDto.js";
import {fetchPsnUser} from "./psn/fetchPsnUser.js";


async function main() {
    console.info("START PSN Fetcher v2")

    const params: Params = getParams();
    const pool: Pool = buildPostgresPool();

    try {
        // Authenticate and add profile in database
        const psnAuthTokens: PsnAuthTokens = await getPsnAuthTokens(params.npsso);
        const psnUser: PsnUserDto = await fetchPsnUser(psnAuthTokens, params.profileName);
        const accountId: string = psnUser.id;
        await insertUserIntoPostgres(pool, psnUser);

        // Fetch titles and trophy sets
        const titlesResponseDTO: PsnTitlesTrophySetResponseDTO = await getTitlesData(psnAuthTokens,
            accountId);
        console.info(`Found ${titlesResponseDTO.titles.length} titles`);
        console.info(`Found ${titlesResponseDTO.trophySets.length} trophy sets`);
        await insertTitlesIntoPostgres(pool, titlesResponseDTO.titles);
        await insertUserTitlesIntoPostgres(pool, psnUser, titlesResponseDTO.titles);
        await insertTrophySetsIntoPostgres(pool, titlesResponseDTO.trophySets);
        await insertTitlesTrophySetIntoPostgres(pool, titlesResponseDTO.links);

        // Fetch trophies for each title
        const trophyResponseDTO: TrophyResponseDTO = await getTrophiesData(psnAuthTokens, accountId, titlesResponseDTO.trophySets);
        console.info(`Found ${trophyResponseDTO.trophies.length} trophies`);
        console.info(`Found ${trophyResponseDTO.earnedTrophies.length} earned trophies`);
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
