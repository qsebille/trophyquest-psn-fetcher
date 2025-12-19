import {PoolClient} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";
import {AppTrophy} from "../../../app/models/appTrophy.js";


export async function insertAppTrophy(
    client: PoolClient,
    trophies: AppTrophy[],
): Promise<InsertQueryResult> {
    if (trophies.length === 0) {
        console.warn("No data to insert into app.trophy table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const batchSize: number = trophies.length > 500 ? 500 : trophies.length;
    let rowsInserted: number = 0;
    let rowsIgnored: number = 0;

    for (let i = 0; i < trophies.length; i += batchSize) {
        const batch = trophies.slice(i, i + batchSize);
        const values: string[] = [];
        const placeholders: string = batch.map((
            trophy,
            idx
        ) => {
            const currentValues = [
                trophy.id,
                trophy.game_id,
                trophy.game_group_id,
                trophy.rank.toString(),
                trophy.title,
                trophy.description,
                trophy.trophy_type,
                trophy.is_hidden.toString(),
                trophy.icon_url,
            ];
            values.push(...currentValues);
            return buildPostgresInsertPlaceholders(currentValues, idx);
        }).join(',');

        const insert = await client.query(`
            INSERT INTO app.trophy (id, game_id, game_group_id, rank, title, description, trophy_type,
                                    is_hidden, icon_url)
            VALUES ${placeholders} ON CONFLICT (id) DO NOTHING
        `, values);

        rowsInserted += insert.rowCount ?? 0;
        rowsIgnored += (batch.length - (insert.rowCount ?? 0));
    }

    return {rowsInserted, rowsIgnored};
}