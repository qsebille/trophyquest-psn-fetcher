import {AppPlayer} from "../appPlayer.js";
import {AppTrophySet} from "../appTrophySet.js";
import {AppPlayedTrophySet} from "../appPlayedTrophySet.js";
import {AppTrophy} from "../appTrophy.js";
import {AppEarnedTrophy} from "../appEarnedTrophy.js";

export interface AppDataWrapper {
    players: AppPlayer[];
    games: AppTrophySet[];
    playedGames: AppPlayedTrophySet[];
    trophies: AppTrophy[];
    earnedTrophies: AppEarnedTrophy[];
}