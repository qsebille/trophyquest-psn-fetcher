import {Pool, PoolClient} from "pg";
import {insertPlayers} from "./insert/psn-player";
import {insertTrophySuites} from "./insert/psn-trophy-suite";
import {insertTrophySuiteGroups} from "./insert/psn-trophy-suite-group";
import {insertPlayedTrophySuites} from "./insert/psn-played-trophy-suite";
import {insertTrophies} from "./insert/psn-trophy";
import {insertEarnedTrophies} from "./insert/psn-earned-trophy";
import {TrophyQuestData} from "../trophyquest/trophyquest-data";

export async function insertTrophyQuestData(
    pool: Pool,
    data: TrophyQuestData,
): Promise<void> {
    const client: PoolClient = await pool.connect();
    try {
        await client.query('BEGIN')
        const playerInsert = await insertPlayers(client, data.players)
        const trophySuiteInsert = await insertTrophySuites(client, data.trophySuites)
        const groupInsert = await insertTrophySuiteGroups(client, data.trophySuiteGroups)
        const trophyInsert = await insertTrophies(client, data.trophies)
        const playedTrophySuiteInsert = await insertPlayedTrophySuites(client, data.playedTrophySuites)
        const earnedTrophyInsert = await insertEarnedTrophies(client, data.earnedTrophies)
        await client.query('COMMIT')

        console.info("🟢 Insert into Postgres : Success")
        logInsertResult('app.psn_player', playerInsert);
        logInsertResult('app.psn_trophy_suite', trophySuiteInsert);
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
