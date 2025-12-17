import {PoolClient} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {PsnTrophySet} from "../../../psn/models/psnTrophySet.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";


/**
 * Inserts an array of PlayStation Network (PSN) trophy sets into the database.
 * If a trophy set with the same ID already exists, it will be ignored.
 *
 * @param {PoolClient} client - The PostgreSQL client used to execute the query.
 * @param {PsnTrophySet[]} psnTrophySets - An array of PSN trophy sets to be inserted into the database.
 *                                          Each trophy set should include properties such as id, name, platform, version, serviceName, and iconUrl.
 * @return {Promise<InsertQueryResult>} A promise that resolves to an object containing the number of rows inserted and ignored.
 */
export async function insertPsnTrophySets(
    client: PoolClient,
    psnTrophySets: PsnTrophySet[]
): Promise<InsertQueryResult> {
    if (psnTrophySets.length === 0) {
        console.warn("No data to update in psn.trophy_set table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = psnTrophySets.map((
        ts,
        idx
    ) => {
        const currentValues = [ts.id, ts.name, ts.platform, ts.version, ts.serviceName, ts.iconUrl];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await client.query(`
        INSERT INTO psn.trophy_set (id, name, platform, version, service_name, icon_url)
        VALUES
            ${placeholders} ON CONFLICT (id)
        DO NOTHING
    `, values);

    const nbInserted = insert.rowCount ?? 0;
    const nbIgnored = psnTrophySets.length - nbInserted;
    return {
        rowsInserted: nbInserted,
        rowsIgnored: nbIgnored
    };
}