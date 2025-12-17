import {PsnPlayedTitle} from "../../psn/models/psnPlayedTitle.js";
import {SchemaIdMap} from "./staging/schemaIdMap.js";

export interface AppPlayedGame {
    player_id: string,
    game_id: string,
    last_played_at: string
}

export function buildAppPlayedGames(
    psnPlayedTitleList: PsnPlayedTitle[],
    schemaIdMap: SchemaIdMap,
): AppPlayedGame[] {
    const appUserGames: AppPlayedGame[] = [];
    const ids = new Set<String>();
    for (const playedTitle of psnPlayedTitleList) {
        const playerId = schemaIdMap.players.get(playedTitle.userId);
        if (!playerId) {
            console.error(`Build played-games: Could not find user ${playedTitle.userId} in schema-id-map.`);
            process.exit(1);
        }
        const gameId = schemaIdMap.games.get(playedTitle.titleId);
        if (!gameId) {
            console.error(`Build played-games: Could not find title ${playedTitle.titleId} in schema-id-map.`);
            process.exit(1);
        }

        const id = `${playerId}-${gameId}`;
        if (!ids.has(id)) {
            appUserGames.push({
                player_id: playerId,
                game_id: gameId,
                last_played_at: playedTitle.lastPlayedDateTime
            });
            ids.add(id);
        }
    }

    return appUserGames;
}