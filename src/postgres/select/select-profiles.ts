import {Pool} from "pg";
import {RefreshProfileData} from "../../models/refresh-profile-data.js";


export async function selectProfiles(pool: Pool): Promise<RefreshProfileData[]> {
    const userQueryResult = await pool.query(`
        select p.pseudo, MAX(et.earned_at) AS last_earned_trophy_timestamp
        from app.psn_player p
                 join app.psn_earned_trophy et on et.player_id = p.id
        group by p.pseudo
    `);

    return userQueryResult.rows.map(row => ({
        pseudo: row.pseudo,
        lastEarnedTrophyTimestamp: new Date(row.last_earned_trophy_timestamp),
    }));
}