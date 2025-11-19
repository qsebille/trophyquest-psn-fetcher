import {TitleTrophySetDTO, TrophySetDTO} from "../psn-titles-trophy-sets.js";
import {Params} from "../utils/params.js";
import {buildInsertPlaceholders, postgresUtils} from "./postgres-utils.js";

export async function insertTrophySetsIntoPostgres(trophySetList: TrophySetDTO[], params: Params): Promise<any> {
    const pool = postgresUtils(params);
    const values: string[] = [];
    const placeholders: string = trophySetList.map((ts, idx) => {
        const currentValues = [ts.id, ts.name, ts.platform, ts.version, ts.serviceName, ts.iconUrl];
        values.push(...currentValues);
        return buildInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await pool.query(`
        INSERT INTO psn.trophy_set (id, name, platform, version, service_name, icon_url)
        VALUES ${placeholders} ON CONFLICT (id) DO NOTHING
    `, values);

    const nbInserted = insert.rowCount;
    const nbIgnored = trophySetList.length - (insert.rowCount ?? 0);
    console.info(`Inserted ${nbInserted} trophy-sets into postgres database ${nbIgnored > 0 ? `(${nbIgnored} ignored)` : ''}`);
}


export async function insertTitlesTrophySetIntoPostgres(joinList: TitleTrophySetDTO[], params: Params): Promise<any> {
    const pool = postgresUtils(params);
    const values: string[] = [];
    const placeholders: string = joinList.map((link, idx) => {
        const currentValues = [link.titleId, link.trophySetId];
        values.push(...currentValues);
        return buildInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await pool.query(`
        INSERT INTO psn.title_trophy_set (title_id, trophy_set_id)
        VALUES ${placeholders} ON CONFLICT (title_id,trophy_set_id) DO NOTHING
    `, values);

    const nbInserted = insert.rowCount;
    const nbIgnored = joinList.length - (insert.rowCount ?? 0);
    console.info(`Inserted ${nbInserted} titles-trophy-sets-links into postgres database ${nbIgnored > 0 ? `(${nbIgnored} ignored)` : ''}`);
}