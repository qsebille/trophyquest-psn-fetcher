import {PoolClient} from "pg";
import {buildPostgresInsertPlaceholders} from "../utils/build-postgres-insert-placeholders.js";
import {TrophyQuestGameImage} from "../../trophyquest/game-image";

export async function insertGameImages(
    client: PoolClient,
    gameImages: TrophyQuestGameImage[],
) {
    if (gameImages.length === 0) {
        console.warn("🟡 No data to insert into app.psn_game_image table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const batchSize: number = gameImages.length > 1000 ? 1000 : gameImages.length;
    let rowsInserted: number = 0;
    let rowsIgnored: number = 0;

    for (let i = 0; i < gameImages.length; i += batchSize) {
        const batch = gameImages.slice(i, i + batchSize);
        const values: string[] = [];
        const placeholders: string = gameImages.map((gameImage, idx) => {
            const currentValues = [gameImage.gameId, gameImage.psnUrl, gameImage.type, gameImage.format];
            values.push(...currentValues);
            return buildPostgresInsertPlaceholders(currentValues, idx);
        }).join(',');
        const insert = await client.query(`
            INSERT INTO app.psn_game_image (game_id, psn_url, type, format)
            VALUES
            ${placeholders} ON CONFLICT (game_id,psn_url)
            DO NOTHING
        `, values);

        rowsInserted += insert.rowCount ?? 0;
        rowsIgnored += (batch.length - (insert.rowCount ?? 0));
    }

    return {rowsInserted, rowsIgnored};
}