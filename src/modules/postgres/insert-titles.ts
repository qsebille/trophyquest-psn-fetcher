import {TitleDTO} from "../psn-titles-trophy-sets.js";
import {Params} from "../params.js";
import {AuthData} from "../auth.js";
import {buildInsertPlaceholders} from "./postgres-utils.js";
import {buildPsnFetcherPool} from "./pool.js";


export async function insertTitlesIntoPostgres(titles: TitleDTO[], params: Params): Promise<any> {
    if (titles.length === 0) {
        console.info("No titles to insert into postgres database.");
        return;
    }

    const pool = buildPsnFetcherPool(params);
    const values: string[] = [];
    const placeholders: string = titles.map((t, idx) => {
        const currentValues = [t.id, t.name, t.category, t.imageUrl];
        values.push(...currentValues);
        return buildInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await pool.query(`
        INSERT INTO psn.title (id, name, category, image_url)
        VALUES
        ${placeholders} ON CONFLICT (id)
        DO NOTHING
    `, values);

    const nbInserted = insert.rowCount;
    const nbIgnored = titles.length - (insert.rowCount ?? 0);
    console.info(`Inserted ${nbInserted} titles into postgres database ${nbIgnored > 0 ? `(${nbIgnored} ignored)` : ''}`);
}

export async function insertUserTitlesIntoPostgres(authData: AuthData, titles: TitleDTO[], params: Params): Promise<any> {
    if (titles.length === 0) {
        console.info("No user titles to insert into postgres database.");
        return;
    }

    const pool = buildPsnFetcherPool(params);
    const values: string[] = [];
    const placeholders: string = titles.map((title, idx) => {
        const currentValues = [authData.userInfo.id, title.id, title.lastPlayedDateTime];
        values.push(...currentValues);
        return buildInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await pool.query(`
        INSERT INTO psn.user_played_title (user_id, title_id, last_played_at)
        VALUES
        ${placeholders} ON CONFLICT (user_id,title_id)
        DO
        UPDATE SET last_played_at=EXCLUDED.last_played_at
    `, values);

    const nbInserted = insert.rowCount;
    const nbIgnored = titles.length - (insert.rowCount ?? 0);
    console.info(`Inserted ${nbInserted} user titles into postgres database ${nbIgnored > 0 ? `(${nbIgnored} ignored)` : ''}`);
}