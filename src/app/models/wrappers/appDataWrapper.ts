import {AppPlayer} from "../appPlayer.js";
import {AppGame} from "../appGame.js";
import {AppPlayedGame} from "../appPlayedGame.js";
import {AppTrophy} from "../appTrophy.js";
import {AppEarnedTrophy} from "../appEarnedTrophy.js";

export interface AppDataWrapper {
    players: AppPlayer[];
    games: AppGame[];
    playedGames: AppPlayedGame[];
    trophies: AppTrophy[];
    earnedTrophies: AppEarnedTrophy[];
}