import {PoolClient} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";
import {AppPlayer} from "../../../app/models/appPlayer.js";


export async function insertAppPlayers(
    client: PoolClient,
    players: AppPlayer[],
): Promise<InsertQueryResult> {
    if (players.length === 0) {
        console.warn("No data to insert into app.player table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = players.map((
        player,
        idx
    ) => {
        const currentValues = [player.id, player.pseudo, player.avatarUrl];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await client.query(`
        INSERT INTO app.player (id, pseudo, avatar_url)
        VALUES ${placeholders} ON CONFLICT (id)
        DO NOTHING
    `, values);

    return {
        rowsInserted: insert.rowCount ?? 0,
        rowsIgnored: 0,
    };
}