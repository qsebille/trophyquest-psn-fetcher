import {Pool} from "pg";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";

export interface PlayerImageData {
    id: string;
    avatar_url: string;
    aws_avatar_url: string | null;
}

export async function getPlayerMissingAwsImages(
    pool: Pool,
    limit: number
): Promise<PlayerImageData[]> {
    const queryResult = await pool.query(`SELECT id, image_url, aws_avatar_url
                                          FROM app.game
                                          WHERE aws_avatar_url IS NULL
                                              LIMIT ${limit}`);

    return queryResult.rows as PlayerImageData[];
}

export async function updatePlayerMissingAwsImages(
    images: PlayerImageData[],
    pool: Pool,
): Promise<InsertQueryResult> {
    if (images.length === 0) {
        console.warn("No game images to update in postgres database.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = images
        .filter(game => game.aws_avatar_url !== null)
        .map((
            game,
            idx
        ) => {
            const currentValues = [game.id, game.aws_avatar_url ?? ''];
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