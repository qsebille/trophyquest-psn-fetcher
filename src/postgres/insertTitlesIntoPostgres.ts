import {Pool} from "pg";
import {buildPostgresInsertPlaceholders} from "./utils/buildPostgresInsertPlaceholders.js";
import {PsnTitle} from "../psn/models/psnTitle.js";

/**
 * Inserts an array of titles into a PostgreSQL database. If a title with the same ID already exists,
 * the insertion for that specific title is ignored.
 *
 * @param {Pool} pool - The database connection pool used to execute the query.
 * @param {PsnTitle[]} titles - An array of title objects containing `id`, `name`, `category`, and `imageUrl` properties to be inserted into the database.
 * @return {Promise<any>} A promise that resolves to the result of the database insertion, containing information about the operation such as rows inserted or ignored.
 */
export async function insertTitlesIntoPostgres(pool: Pool, titles: PsnTitle[]): Promise<any> {
    if (titles.length === 0) {
        console.info("No titles to insert into postgres database.");
        return;
    }

    const values: string[] = [];
    const placeholders: string = titles.map((t, idx) => {
        const currentValues = [t.id, t.name, t.category, t.imageUrl];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
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