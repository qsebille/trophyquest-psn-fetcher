import {Pool} from "pg";
import {buildPostgresInsertPlaceholders} from "./utils/buildPostgresInsertPlaceholders.js";
import {PsnTrophySet} from "../psn/models/psnTrophySet.js";

/**
 * Inserts a list of PSN trophy sets into the PostgreSQL database.
 * If a trophy set with the same ID already exists in the database, it will be ignored.
 *
 * @param {Pool} pool - The PostgreSQL connection pool used for running the query.
 * @param {PsnTrophySet[]} psnTrophySets - An array of trophy set objects to be inserted into the database.
 * Each trophy set contains id, name, platform, version, serviceName, and iconUrl properties.
 * @return {Promise<any>} A promise that resolves when the insert operation is completed.
 * The resolved value contains information about the result of the query, such as the number of rows inserted.
 */
export async function insertTrophySetsIntoPostgres(pool: Pool, psnTrophySets: PsnTrophySet[]): Promise<any> {
    if (psnTrophySets.length === 0) {
        console.info("No trophy-sets to insert into postgres database.");
        return;
    }

    const values: string[] = [];
    const placeholders: string = psnTrophySets.map((ts, idx) => {
        const currentValues = [ts.id, ts.name, ts.platform, ts.version, ts.serviceName, ts.iconUrl];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await pool.query(`
        INSERT INTO psn.trophy_set (id, name, platform, version, service_name, icon_url)
        VALUES
            ${placeholders} ON CONFLICT (id)
        DO NOTHING
    `, values);

    const nbInserted = insert.rowCount;
    const nbIgnored = psnTrophySets.length - (insert.rowCount ?? 0);
    console.info(`Inserted ${nbInserted} trophy-sets into postgres database ${nbIgnored > 0 ? `(${nbIgnored} ignored)` : ''}`);
}