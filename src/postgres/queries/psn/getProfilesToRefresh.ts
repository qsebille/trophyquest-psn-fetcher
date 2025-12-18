import {Pool} from "pg";
import {ProfileToRefresh} from "../../models/profileToRefresh.js";


export async function getProfilesToRefresh(pool: Pool): Promise<ProfileToRefresh[]> {
    const userQueryResult = await pool.query(`
        SELECT p.pseudo, MAX(pg.last_played_at) AS last_played_timestamp
        FROM app.played_game pg
                 JOIN app.player p ON p.id = pg.player_id
        GROUP BY p.pseudo
    `);

    return userQueryResult.rows.map(row => ({
        pseudo: row.pseudo,
        lastPlayedTimestamp: new Date(row.last_played_timestamp),
    }));
}