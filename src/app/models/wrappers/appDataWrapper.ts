import {AppPlayer} from "../appPlayer.js";
import {AppGame} from "../appGame.js";
import {AppPlayedGame} from "../appPlayedGame.js";
import {AppTrophyCollection} from "../appTrophyCollection.js";
import {AppPlayedTrophyCollection} from "../appPlayedTrophyCollection.js";
import {AppTrophy} from "../appTrophy.js";
import {AppEarnedTrophy} from "../appEarnedTrophy.js";

export interface AppDataWrapper {
    players: AppPlayer[];
    games: AppGame[];
    playedGames: AppPlayedGame[];
    trophyCollections: AppTrophyCollection[];
    playedTrophyCollections: AppPlayedTrophyCollection[];
    trophies: AppTrophy[];
    earnedTrophies: AppEarnedTrophy[];
}