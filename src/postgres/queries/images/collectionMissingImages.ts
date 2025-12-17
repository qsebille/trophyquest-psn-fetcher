import {Pool} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";

export interface CollectionImageData {
    id: string;
    image_url: string;
    aws_image_url: string | null;
}

export async function getCollectionMissingAwsImages(
    pool: Pool,
    limit: number
): Promise<CollectionImageData[]> {
    const queryResult = await pool.query(`SELECT id, image_url, aws_image_url
                                          FROM app.trophy_collection
                                          WHERE aws_image_url IS NULL
                                              LIMIT ${limit}`);

    return queryResult.rows as CollectionImageData[];
}

export async function updateCollectionMissingAwsImages(
    images: CollectionImageData[],
    pool: Pool,
): Promise<InsertQueryResult> {
    if (images.length === 0) {
        console.warn("No data to update in app.trophy_collection table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = images
        .filter(collection => collection.aws_image_url !== null)
        .map((
            collection,
            idx
        ) => {
            const currentValues = [collection.id, collection.aws_image_url ?? ''];
            values.push(...currentValues);
            return buildPostgresInsertPlaceholders(currentValues, idx);
        }).join(',');

    const update = await pool.query(
        `
            UPDATE app.trophy_collection AS tc
            SET aws_image_url = v.aws_image_url FROM ( VALUES ${placeholders} ) AS v(id, aws_image_url)
            WHERE tc.id = v.id::uuid
        `,
        values
    );

    const rowsInserted = update.rowCount ?? 0;
    const rowsIgnored = images.length - rowsInserted;
    return {rowsInserted, rowsIgnored};
}