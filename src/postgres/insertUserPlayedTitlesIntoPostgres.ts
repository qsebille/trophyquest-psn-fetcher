import {Pool} from "pg";
import {buildPostgresInsertPlaceholders} from "./utils/buildPostgresInsertPlaceholders.js";
import {PsnUserPlayedTitle} from "../psn/models/psnUserPlayedTitle.js";


export async function insertUserPlayedTitlesIntoPostgres(
    pool: Pool,
    data: PsnUserPlayedTitle[]
): Promise<any> {
    if (data.length === 0) {
        console.info("No user titles to insert into postgres database.");
        return;
    }

    const values: string[] = [];
    const placeholders: string = data.map((
        playedTitle,
        idx
    ) => {
        const currentValues = [playedTitle.userId, playedTitle.titleId, playedTitle.lastPlayedDateTime];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await pool.query(`
        INSERT INTO psn.user_played_title (user_id, title_id, last_played_at)
        VALUES
            ${placeholders} ON CONFLICT (user_id,title_id)
        DO
        UPDATE SET last_played_at=EXCLUDED.last_played_at
    `, values);

    const nbInserted = insert.rowCount;
    const nbIgnored = data.length - (insert.rowCount ?? 0);
    console.info(`Inserted ${nbInserted} user played titles into postgres database ${nbIgnored > 0 ? `(${nbIgnored} ignored)` : ''}`);
}