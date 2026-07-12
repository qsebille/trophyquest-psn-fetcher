import {PoolClient} from "pg";
import {buildPostgresInsertPlaceholders} from "../utils/build-postgres-insert-placeholders.js";
import {TrophyQuestPlayedGame} from "../../trophyquest/played-game";

export async function insertPlayedGames(
    client: PoolClient,
    playedGames: TrophyQuestPlayedGame[],
) {
    if (playedGames.length === 0) {
        console.warn("🟡 No data to insert into app.psn_played_game table.");
        return {rowsInserted: 0, rowsIgnored: 0};
    }

    const batchSize: number = playedGames.length > 1000 ? 1000 : playedGames.length;
    let rowsInserted: number = 0;

    for (let i = 0; i < playedGames.length; i += batchSize) {
        const batch = playedGames.slice(i, i + batchSize);
        const values: string[] = [];
        const placeholders: string = batch.map((playedGame, idx) => {
            const currentValues = [
                playedGame.playerId,
                playedGame.gameId,
                playedGame.lastPlayedAt,
            ];
            values.push(...currentValues);
            return buildPostgresInsertPlaceholders(currentValues, idx);
        }).join(',');

        const insert = await client.query(`
            INSERT INTO app.psn_played_game (player_id, game_id, last_played_at)
            VALUES
            ${placeholders} ON CONFLICT (player_id,game_id)
            DO UPDATE SET last_played_at=EXCLUDED.last_played_at
        `, values);

        rowsInserted += insert.rowCount ?? 0;
    }

    return {rowsInserted, rowsIgnored: 0};
}