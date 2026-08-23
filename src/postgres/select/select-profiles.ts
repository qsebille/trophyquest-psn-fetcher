import {Pool} from "pg";
import {RefreshProfileData} from "../../models/refresh-profile-data.js";


export async function selectProfiles(pool: Pool): Promise<RefreshProfileData[]> {
    const userQueryResult = await pool.query(`
        select p.pseudo,
               MAX(ps.last_played_at) as last_played_suite
        from app.psn_player p
                 join app.psn_played_suite ps on ps.player_id = p.id
        group by p.pseudo
    `);

    return userQueryResult.rows.map(row => ({
        pseudo: row.pseudo,
        lastPlayedSuite: new Date(row.last_played_suite),
    }));
}