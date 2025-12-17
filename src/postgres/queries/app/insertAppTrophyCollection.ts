import {PoolClient} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";
import {AppTrophyCollection} from "../../../app/models/appTrophyCollection.js";


export async function insertAppTrophyCollection(
    client: PoolClient,
    collections: AppTrophyCollection[],
): Promise<InsertQueryResult> {
    if (collections.length === 0) {
        console.warn("No data to insert into app.trophy_collection table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = collections.map((
        collection,
        idx
    ) => {
        const currentValues = [collection.id, collection.game_id, collection.title, collection.platform, collection.image_url];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await client.query(`
        INSERT INTO app.trophy_collection (id, game_id, title, platform, image_url)
        VALUES ${placeholders} ON CONFLICT (id) DO NOTHING
    `, values);

    return {
        rowsInserted: insert.rowCount ?? 0,
        rowsIgnored: collections.length - (insert.rowCount ?? 0),
    };
}