import {Pool} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";

export interface TrophyImageData {
    id: string;
    icon_url: string;
    aws_icon_url: string | null;
}

export async function getTrophyMissingAwsImages(
    pool: Pool,
    limit: number
): Promise<TrophyImageData[]> {
    const queryResult = await pool.query(`SELECT id, icon_url, aws_icon_url
                                          FROM app.trophy
                                          WHERE aws_icon_url IS NULL
                                              LIMIT ${limit}`);

    return queryResult.rows as TrophyImageData[];
}

export async function updateTrophyMissingAwsImages(
    images: TrophyImageData[],
    pool: Pool,
): Promise<InsertQueryResult> {
    if (images.length === 0) {
        console.warn("No data to update in app.trophy table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = images
        .filter(trophy => trophy.aws_icon_url !== null)
        .map((
            trophy,
            idx
        ) => {
            const currentValues = [trophy.id, trophy.aws_icon_url ?? ''];
            values.push(...currentValues);
            return buildPostgresInsertPlaceholders(currentValues, idx);
        }).join(',');

    const update = await pool.query(
        `
            UPDATE app.trophy AS t
            SET aws_icon_url = v.aws_icon_url FROM ( VALUES ${placeholders} ) AS v(id, aws_icon_url)
            WHERE t.id = v.id::uuid
        `,
        values
    );

    const rowsInserted = update.rowCount ?? 0;
    const rowsIgnored = images.length - rowsInserted;
    return {rowsInserted, rowsIgnored};
}