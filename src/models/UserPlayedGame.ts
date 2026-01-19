import {Game} from "./Game.js";

export interface UserPlayedGame {
    game: Game,
    playerId: string,
    firstPlayedAt: string,
    lastPlayedAt: string,
}