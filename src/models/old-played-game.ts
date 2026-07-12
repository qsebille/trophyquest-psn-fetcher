import {Game} from "./game.js";

export interface OldPlayedGame {
    game: Game,
    playerId: string,
    firstPlayedAt: string,
    lastPlayedAt: string,
}