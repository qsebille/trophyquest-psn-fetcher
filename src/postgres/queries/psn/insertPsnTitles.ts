import {PoolClient} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {PsnTitle} from "../../../psn/models/psnTitle.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";


export async function insertPsnTitles(
    client: PoolClient,
    psnTitleList: PsnTitle[]
): Promise<InsertQueryResult> {
    if (psnTitleList.length === 0) {
        console.warn("No data to update in psn.title table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = psnTitleList.map((
        ts,
        idx
    ) => {
        const currentValues = [ts.id, ts.name, ts.platform, ts.version, ts.iconUrl];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await client.query(`
        INSERT INTO psn.title (id, name, platform, version, icon_url)
        VALUES
            ${placeholders} ON CONFLICT (id)
        DO NOTHING
    `, values);

    const nbInserted = insert.rowCount ?? 0;
    const nbIgnored = psnTitleList.length - nbInserted;
    return {
        rowsInserted: nbInserted,
        rowsIgnored: nbIgnored
    };
}