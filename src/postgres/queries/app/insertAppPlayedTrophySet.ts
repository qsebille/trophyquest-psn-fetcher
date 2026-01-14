import {PoolClient} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";
import {AppPlayedTrophySet} from "../../../app/models/appPlayedTrophySet.js";


export async function insertAppPlayedTrophySet(
    client: PoolClient,
    playedTrophySets: AppPlayedTrophySet[],
): Promise<InsertQueryResult> {
    if (playedTrophySets.length === 0) {
        console.warn("No data to insert into app.played_trophy_set table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const batchSize: number = playedTrophySets.length > 1000 ? 1000 : playedTrophySets.length;
    let rowsInserted: number = 0;

    for (let i = 0; i < playedTrophySets.length; i += batchSize) {
        const batch = playedTrophySets.slice(i, i + batchSize);
        const values: string[] = [];
        const placeholders: string = batch.map((playedTrophySet, idx) => {
            const currentValues = [playedTrophySet.playerId, playedTrophySet.trophySetId, playedTrophySet.lastPlayedAt];
            values.push(...currentValues);
            return buildPostgresInsertPlaceholders(currentValues, idx);
        }).join(',');

        const insert = await client.query(`
            INSERT INTO app.played_trophy_set (player_id, trophy_set_id, last_played_at)
            VALUES ${placeholders} ON CONFLICT (player_id,trophy_set_id) DO
            UPDATE
                SET last_played_at=EXCLUDED.last_played_at
        `, values);

        rowsInserted += insert.rowCount ?? 0;
    }

    return {rowsInserted, rowsIgnored: 0};
}