import {Pool, PoolClient} from "pg";
import {EditionTrophySuiteLink} from "../models/EditionTrophySuiteLink.js";
import {insertIntoPsnGameTable} from "./insert/insertIntoPsnGameTable.js";
import {UserPlayedGame} from "../models/UserPlayedGame.js";
import {UserPlayedEdition} from "../models/UserPlayedEdition.js";
import {TrophySuiteGroup} from "../models/TrophySuiteGroup.js";
import {EarnedTrophy} from "../models/EarnedTrophy.js";
import {Trophy} from "../models/Trophy.js";
import {UserPlayedTrophySuite} from "../models/UserPlayedTrophySuite.js";
import {Player} from "../models/Player.js";
import {insertIntoPsnPlayerTable} from "./insert/insertIntoPsnPlayerTable.js";
import {insertIntoPsnPlayedGameTable} from "./insert/insertIntoPsnPlayedGameTable.js";
import {insertIntoPsnGameImageTable} from "./insert/insertIntoPsnGameImageTable.js";
import {insertIntoPsnEditionTable} from "./insert/insertIntoPsnEditionTable.js";
import {insertIntoPsnPlayedEditionTable} from "./insert/insertIntoPsnPlayedEditionTable.js";
import {insertIntoPsnTrophySuiteTable} from "./insert/insertIntoPsnTrophySuiteTable.js";
import {insertIntoPsnEditionTrophySuiteTable} from "./insert/insertIntoPsnEditionTrophySuiteTable.js";
import {insertIntoPsnTrophySuiteGroupTable} from "./insert/insertIntoPsnTrophySuiteGroupTable.js";
import {insertIntoPsnPlayedTrophySuiteTable} from "./insert/insertIntoPsnPlayedTrophySuiteTable.js";
import {insertIntoPsnTrophyTable} from "./insert/insertIntoPsnTrophyTable.js";
import {insertIntoPsnEarnedTrophyTable} from "./insert/insertIntoPsnEarnedTrophyTable.js";

export async function insertIntoTrophyQuestDatabase(
    pool: Pool,
    players: Player[],
    playedGames: UserPlayedGame[],
    playedEditions: UserPlayedEdition[],
    playedTrophySuites: UserPlayedTrophySuite[],
    editionTrophySuiteLinks: EditionTrophySuiteLink[],
    trophySuiteGroups: TrophySuiteGroup[],
    trophies: Trophy[],
    earnedTrophies: EarnedTrophy[],
): Promise<void> {
    const client: PoolClient = await pool.connect();
    try {
        await client.query('BEGIN')
        const playerInsert = await insertIntoPsnPlayerTable(client, players)
        const gameInsert = await insertIntoPsnGameTable(client, playedGames.map(pg => pg.game))
        const playedGameInsert = await insertIntoPsnPlayedGameTable(client, playedGames)
        const gameImageInsert = await insertIntoPsnGameImageTable(client, playedGames.map(pg => pg.game))
        const editionInsert = await insertIntoPsnEditionTable(client, playedEditions.map(pe => pe.edition))
        const playedEditionInsert = await insertIntoPsnPlayedEditionTable(client, playedEditions)
        const trophySuiteInsert = await insertIntoPsnTrophySuiteTable(client, playedTrophySuites.map(pts => pts.trophySuite))
        const linkInsert = await insertIntoPsnEditionTrophySuiteTable(client, editionTrophySuiteLinks)
        const groupInsert = await insertIntoPsnTrophySuiteGroupTable(client, trophySuiteGroups)
        const playedTrophySuiteInsert = await insertIntoPsnPlayedTrophySuiteTable(client, playedTrophySuites)
        const trophyInsert = await insertIntoPsnTrophyTable(client, trophies)
        const earnedTrophyInsert = await insertIntoPsnEarnedTrophyTable(client, earnedTrophies)
        await client.query('COMMIT')

        logInsertResult('app.psn_player', playerInsert);
        logInsertResult('app.psn_game', gameInsert);
        logInsertResult('app.psn_played_game', playedGameInsert);
        logInsertResult('app.psn_game_image', gameImageInsert);
        logInsertResult('app.psn_edition', editionInsert);
        logInsertResult('app.psn_played_edition', playedEditionInsert);
        logInsertResult('app.psn_trophy_suite', trophySuiteInsert);
        logInsertResult('app.psn_edition_trophy_suite', linkInsert);
        logInsertResult('app.psn_trophy_suite_group', groupInsert);
        logInsertResult('app.psn_played_trophy_suite', playedTrophySuiteInsert);
        logInsertResult('app.psn_trophy', trophyInsert);
        logInsertResult('app.psn_earned_trophy', earnedTrophyInsert);
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

function logInsertResult(
    tableName: string,
    result: { rowsInserted: number, rowsIgnored: number }
) {
    console.info(`Postgres: Inserted ${result.rowsInserted} lines into ${tableName} table ${result.rowsIgnored > 0 ? `(${result.rowsIgnored} ignored)` : ''}`);
}
