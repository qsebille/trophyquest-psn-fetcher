import {PoolClient} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";
import {AppGame} from "../../../app/models/appGame.js";


export async function insertAppGame(
    client: PoolClient,
    games: AppGame[],
): Promise<InsertQueryResult> {
    if (games.length === 0) {
        console.warn("No data to insert into app.game table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = games.map((
        game,
        idx
    ) => {
        const currentValues = [game.id, game.title, game.platform, game.imageUrl];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await client.query(`
        INSERT INTO app.game (id, title, platform, image_url)
        VALUES ${placeholders} ON CONFLICT (id) DO NOTHING
    `, values);

    return {
        rowsInserted: insert.rowCount ?? 0,
        rowsIgnored: games.length - (insert.rowCount ?? 0),
    };
}