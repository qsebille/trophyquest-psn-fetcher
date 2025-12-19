import {PoolClient} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";
import {AppEarnedTrophy} from "../../../app/models/appEarnedTrophy.js";


export async function insertAppEarnedTrophy(
    client: PoolClient,
    earnedTophies: AppEarnedTrophy[],
): Promise<InsertQueryResult> {
    if (earnedTophies.length === 0) {
        console.warn("No data to insert into app.earned_trophy table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const batchSize: number = earnedTophies.length > 1000 ? 1000 : earnedTophies.length;
    let rowsInserted: number = 0;
    let rowsIgnored: number = 0;

    for (let i = 0; i < earnedTophies.length; i += batchSize) {
        const batch = earnedTophies.slice(i, i + batchSize);
        const values: string[] = [];
        const placeholders: string = batch.map((
            earned,
            idx
        ) => {
            const currentValues = [earned.playerId, earned.trophyId, earned.earnedAt];
            values.push(...currentValues);
            return buildPostgresInsertPlaceholders(currentValues, idx);
        }).join(',');

        const insert = await client.query(`
            INSERT INTO app.earned_trophy (player_id, trophy_id, earned_at)
            VALUES ${placeholders} ON CONFLICT (player_id, trophy_id) DO NOTHING
        `, values);

        rowsInserted += insert.rowCount ?? 0;
        rowsIgnored += (batch.length - (insert.rowCount ?? 0));
    }

    return {rowsInserted, rowsIgnored};
}