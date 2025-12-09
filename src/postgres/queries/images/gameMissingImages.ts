import {Pool} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";

export interface GameImageData {
    id: string;
    image_url: string;
    aws_image_url: string | null;
}

export async function getGameMissingAwsImages(
    pool: Pool,
    limit: number
): Promise<GameImageData[]> {
    const queryResult = await pool.query(`SELECT id, image_url, aws_image_url
                                          FROM app.game
                                          WHERE aws_image_url IS NULL
                                              LIMIT ${limit}`);

    return queryResult.rows as GameImageData[];
}

export async function updateGameMissingAwsImages(
    images: GameImageData[],
    pool: Pool,
): Promise<InsertQueryResult> {
    if (images.length === 0) {
        console.warn("No game images to update in postgres database.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = images
        .filter(game => game.aws_image_url !== null)
        .map((
            game,
            idx
        ) => {
            const currentValues = [game.id, game.aws_image_url ?? ''];
            values.push(...currentValues);
            return buildPostgresInsertPlaceholders(currentValues, idx);
        }).join(',');

    const update = await pool.query(
        `
            UPDATE app.game AS g
            SET aws_image_url = v.aws_image_url FROM ( VALUES ${placeholders} ) AS v(id, aws_image_url)
            WHERE g.id = v.id::uuid
        `,
        values
    );

    const rowsInserted = update.rowCount ?? 0;
    const rowsIgnored = images.length - rowsInserted;
    return {rowsInserted, rowsIgnored};
}