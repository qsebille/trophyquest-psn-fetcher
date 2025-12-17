import {PoolClient} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";
import {AppPlayedTrophyCollection} from "../../../app/models/appPlayedTrophyCollection.js";


export async function insertAppPlayedTrophyCollection(
    client: PoolClient,
    playedTrophyCollections: AppPlayedTrophyCollection[],
): Promise<InsertQueryResult> {
    if (playedTrophyCollections.length === 0) {
        console.warn("No data to insert into app.played_trophy_collection table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const batchSize: number = playedTrophyCollections.length > 1000 ? 1000 : playedTrophyCollections.length;
    let rowsInserted: number = 0;
    let rowsIgnored: number = 0;

    for (let i = 0; i < playedTrophyCollections.length; i += batchSize) {
        const batch = playedTrophyCollections.slice(i, i + batchSize);
        const values: string[] = [];
        const placeholders: string = batch.map((
            earned,
            idx
        ) => {
            const currentValues = [earned.player_id, earned.trophy_collection_id];
            values.push(...currentValues);
            return buildPostgresInsertPlaceholders(currentValues, idx);
        }).join(',');

        const insert = await client.query(`
            INSERT INTO app.played_trophy_collection (player_id, trophy_collection_id)
            VALUES ${placeholders} ON CONFLICT (player_id,trophy_collection_id) DO NOTHING
        `, values);

        rowsInserted += insert.rowCount ?? 0;
        rowsIgnored += (batch.length - (insert.rowCount ?? 0));
    }

    return {rowsInserted, rowsIgnored};
}