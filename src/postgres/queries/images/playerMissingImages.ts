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
    const queryResult = await pool.query(`SELECT id, avatar_url, aws_avatar_url
                                          FROM app.player
                                          WHERE aws_avatar_url IS NULL
                                              LIMIT ${limit}`);

    return queryResult.rows as PlayerImageData[];
}

export async function updatePlayerMissingAwsImages(
    images: PlayerImageData[],
    pool: Pool,
): Promise<InsertQueryResult> {
    if (images.length === 0) {
        console.warn("No data to update in app.player table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const values: string[] = [];
    const placeholders: string = images
        .filter(player => player.aws_avatar_url !== null)
        .map((
            player,
            idx
        ) => {
            const currentValues = [player.id, player.aws_avatar_url ?? ''];
            values.push(...currentValues);
            return buildPostgresInsertPlaceholders(currentValues, idx);
        }).join(',');

    const update = await pool.query(
        `
            UPDATE app.player AS p
            SET aws_avatar_url = v.aws_avatar_url FROM ( VALUES ${placeholders} ) AS v(id, aws_avatar_url)
            WHERE p.id = v.id::uuid
        `,
        values
    );

    const rowsInserted = update.rowCount ?? 0;
    const rowsIgnored = images.length - rowsInserted;
    return {rowsInserted, rowsIgnored};
}