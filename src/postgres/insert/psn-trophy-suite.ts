import {PoolClient} from "pg";
import {buildPostgresInsertPlaceholders} from "../utils/build-postgres-insert-placeholders.js";
import {TrophyQuestTrophySuite} from "../../trophyquest/trophy-suite";

async function insertBatchWithGameIds(
    client: PoolClient,
    batch: TrophyQuestTrophySuite[],
) {
}

async function insertBatchWithoutGameIds(
    client: PoolClient,
    batch: TrophyQuestTrophySuite[],
) {
    const values: string[] = [];
    const placeholders: string = batch.map((ts, idx) => {
        const currentValues = [
            ts.id,
            ts.name,
            ts.psnIconUrl,
            `{${ts.platforms}}`,
        ]
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');
    const insert = await client.query(`
        INSERT INTO app.psn_trophy_suite (id, name, psn_image_url, platforms)
        VALUES
        ${placeholders}
        ON CONFLICT (id)
        DO NOTHING
    `, values);

    return {rowsInserted: insert.rowCount ?? 0, rowsIgnored: (batch.length - (insert.rowCount ?? 0))};
}


export async function insertTrophySuites(
    client: PoolClient,
    trophySuites: TrophyQuestTrophySuite[],
) {
    if (trophySuites.length === 0) {
        console.warn("🟡 No data to insert into app.psn_trophy_suite table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const batchSize: number = trophySuites.length > 1000 ? 1000 : trophySuites.length;
    let rowsInserted: number = 0;
    let rowsIgnored: number = 0;

    for (let i = 0; i < trophySuites.length; i += batchSize) {
        const batch = trophySuites.slice(i, i + batchSize);
        const values: string[] = [];
        const placeholders: string = batch.map((ts, idx) => {
            const currentValues = [
                ts.id,
                ts.name,
                ts.psnIconUrl,
                `{${ts.platforms}}`,
            ]
            values.push(...currentValues);
            return buildPostgresInsertPlaceholders(currentValues, idx);
        }).join(',');
        const insert = await client.query(`
            INSERT INTO app.psn_trophy_suite (id, name, psn_image_url, platforms)
            VALUES
            ${placeholders}
        ON CONFLICT (id)
            DO UPDATE SET game_id=EXCLUDED.game_id
        `, values);

        rowsInserted += insert.rowCount ?? 0;
        rowsIgnored += (batch.length - (insert.rowCount ?? 0));
    }

    return {rowsInserted, rowsIgnored};
}