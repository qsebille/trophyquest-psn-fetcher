import {Params} from "../params.js";
import {buildPsnFetcherPool} from "./pool.js";
import {EarnedTrophyDTO, TrophyDTO} from "../psn-trophy.js";
import {buildInsertPlaceholders} from "./postgres-utils.js";

const TROPHY_BATCH_SIZE: number = 200;

export async function insertTrophiesIntoPostgres(trophies: TrophyDTO[], params: Params): Promise<any> {
    if (trophies.length === 0) {
        console.info("No trophies to insert into postgres database.");
        return;
    }

    const pool = buildPsnFetcherPool(params);
    let nbIgnored: number = 0;
    let nbInserted: number = 0;

    for (let i = 0; i < trophies.length; i += TROPHY_BATCH_SIZE) {
        const batch = trophies.slice(i, i + TROPHY_BATCH_SIZE);
        const values: string[] = [];
        const placeholders: string = batch.map((t, idx) => {
            const currentValues: string[] = [
                t.id,
                t.trophySetId,
                t.rank.toString(),
                t.title,
                t.detail,
                t.isHidden.toString(),
                t.trophyType,
                t.iconUrl,
                t.groupId,
            ];
            values.push(...currentValues);
            return buildInsertPlaceholders(currentValues, idx);
        }).join(',');

        const insert = await pool.query(`
            INSERT INTO psn.trophy (id, trophy_set_id, rank, title, detail, is_hidden, trophy_type, icon_url,
                                    game_group_id)
            VALUES
            ${placeholders} ON CONFLICT (id)
            DO NOTHING
        `, values);

        nbInserted += insert.rowCount ?? 0;
        nbIgnored += (batch.length - (insert.rowCount ?? 0));
    }

    console.info(`Inserted ${nbInserted} trophies into postgres database ${nbIgnored > 0 ? `(${nbIgnored} ignored)` : ''}`);
}

export async function insertEarnedTrophiesIntoPostgres(earnedTrophies: EarnedTrophyDTO[], params: Params): Promise<any> {
    if (earnedTrophies.length === 0) {
        console.info("No earned trophies to insert into postgres database.");
        return;
    }

    const pool = buildPsnFetcherPool(params);
    let nbIgnored: number = 0;
    let nbInserted: number = 0;

    for (let i = 0; i < earnedTrophies.length; i += TROPHY_BATCH_SIZE) {
        const batch = earnedTrophies.slice(i, i + TROPHY_BATCH_SIZE);
        const values: string[] = [];
        const placeholders: string = batch.map((trophy, idx) => {
            const currentValues: string[] = [
                trophy.trophyId,
                trophy.userId,
                trophy.earnedDateTime,
            ];
            values.push(...currentValues);
            return buildInsertPlaceholders(currentValues, idx);
        }).join(',');

        const insert = await pool.query(`
            INSERT INTO psn.user_earned_trophy (trophy_id, user_id, earned_at)
            VALUES
            ${placeholders} ON CONFLICT (trophy_id,user_id)
            DO NOTHING
        `, values);

        nbInserted += insert.rowCount ?? 0;
        nbIgnored += (batch.length - (insert.rowCount ?? 0));
    }

    console.info(`Inserted ${nbInserted} earned trophies into postgres database ${nbIgnored > 0 ? `(${nbIgnored} ignored)` : ''}`);
}