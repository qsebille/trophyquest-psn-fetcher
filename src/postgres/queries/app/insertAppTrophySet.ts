import {PoolClient} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";
import {AppTrophySet} from "../../../app/models/appTrophySet.js";


export async function insertAppTrophySet(
    client: PoolClient,
    trophySets: AppTrophySet[],
): Promise<InsertQueryResult> {
    if (trophySets.length === 0) {
        console.warn("No data to insert into app.trophy_set table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = trophySets.map((trophySet, idx) => {
        const currentValues = [trophySet.id, trophySet.title, trophySet.platform, trophySet.imageUrl];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await client.query(`
        INSERT INTO app.trophy_set (id, title, platform, image_url)
        VALUES ${placeholders} ON CONFLICT (id) DO NOTHING
    `, values);

    return {
        rowsInserted: insert.rowCount ?? 0,
        rowsIgnored: trophySets.length - (insert.rowCount ?? 0),
    };
}