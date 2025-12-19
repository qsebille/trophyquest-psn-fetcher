import {PsnPlayedTitle} from "../../psn/models/psnPlayedTitle.js";
import {computeGameUuid, computeUserUuid} from "../utils/uuid.js";

export interface AppPlayedGame {
    player_id: string;
    game_id: string;
}

export function buildAppPlayedGames(psnPlayedTitleList: PsnPlayedTitle[]): AppPlayedGame[] {
    return psnPlayedTitleList.map(t => {
        return {
            player_id: computeUserUuid(t.userId),
            game_id: computeGameUuid(t.titleId),
            last_played_at: t.lastPlayedDateTime
        }
    });
}