import {PsnPlayedTitle} from "../../psn/models/psnPlayedTitle.js";
import {computeGameUuid, computeUserUuid} from "../utils/uuid.js";

export interface AppPlayedGame {
    playerId: string;
    gameId: string;
    lastPlayedAt: string;
}

export function buildAppPlayedGames(psnPlayedTitleList: PsnPlayedTitle[]): AppPlayedGame[] {
    return psnPlayedTitleList.map(t => {
        return {
            playerId: computeUserUuid(t.userId),
            gameId: computeGameUuid(t.titleId),
            lastPlayedAt: t.lastPlayedDateTime
        }
    });
}