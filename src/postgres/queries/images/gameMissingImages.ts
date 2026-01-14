import {Pool} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";

export interface TrophySetImageData {
    id: string;
    image_url: string;
    aws_image_url: string | null;
}

export async function getTrophySetMissingAwsImages(
    pool: Pool,
    limit: number
): Promise<TrophySetImageData[]> {
    const queryResult = await pool.query(`SELECT id, image_url, aws_image_url
                                          FROM app.trophy_set
                                          WHERE aws_image_url IS NULL
                                              LIMIT ${limit}`);

    return queryResult.rows as TrophySetImageData[];
}

export async function updateTrophySetMissingAwsImages(
    images: TrophySetImageData[],
    pool: Pool,
): Promise<InsertQueryResult> {
    if (images.length === 0) {
        console.warn("No data to update in app.trophy_set table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = images
        .filter(trophySet => trophySet.aws_image_url !== null)
        .map((trophySet, idx) => {
            const currentValues = [trophySet.id, trophySet.aws_image_url ?? ''];
            values.push(...currentValues);
            return buildPostgresInsertPlaceholders(currentValues, idx);
        }).join(',');

    const update = await pool.query(
        `
            UPDATE app.trophy_set AS g
            SET aws_image_url = v.aws_image_url FROM ( VALUES ${placeholders} ) AS v(id, aws_image_url)
            WHERE g.id = v.id::uuid
        `,
        values
    );

    const rowsInserted = update.rowCount ?? 0;
    const rowsIgnored = images.length - rowsInserted;
    return {rowsInserted, rowsIgnored};
}