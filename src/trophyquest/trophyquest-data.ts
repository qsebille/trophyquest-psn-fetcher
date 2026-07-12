import {buildTrophyQuestPlayer, TrophyQuestPlayer} from "./player";
import {buildTrophyQuestGames, TrophyQuestGame} from "./game";
import {buildTrophyQuestTrophySuiteGroups, TrophyQuestTrophySuiteGroup} from "./trophy-suite-group";
import {buildTrophyQuestTrophySuites, TrophyQuestTrophySuite} from "./trophy-suite";
import {buildTrophyQuestTrophies, TrophyQuestTrophy} from "./trophy";
import {buildTrophyQuestGameImages, TrophyQuestGameImage} from "./game-image";
import {buildTrophyQuestPlayedTrophySuites, TrophyQuestPlayedTrophySuite} from "./played-trophy-suite";
import {buildTrophyQuestPlayedGames, TrophyQuestPlayedGame} from "./played-game";
import {buildTrophyQuestEarnedTrophies, TrophyQuestEarnedTrophy} from "./earned-trophy";
import {PlayedGame} from "../psn/game/played-game.model";
import {PlayedTrophySuite} from "../psn/trophysuite/played-trophy-suite.model";
import {Trophy} from "../psn/trophy/trophy.model";
import {EarnedTrophy} from "../psn/trophy/earned-trophy.model";
import {TrophySuiteGroup} from "../psn/trophy/trophy-suite-group.model";
import {Player} from "../psn/player/player.model";

export interface TrophyQuestData {
    players: TrophyQuestPlayer[]
    games: TrophyQuestGame[]
    gameImages: TrophyQuestGameImage[]
    trophySuites: TrophyQuestTrophySuite[]
    trophySuiteGroups: TrophyQuestTrophySuiteGroup[]
    trophies: TrophyQuestTrophy[]
    playedGames: TrophyQuestPlayedGame[]
    playedTrophySuites: TrophyQuestPlayedTrophySuite[]
    earnedTrophies: TrophyQuestEarnedTrophy[]
}

export function buildTrophyquestPlayerData(
    accountId: string,
    players: Player[],
    playedGames: PlayedGame[],
    playedTrophySuites: PlayedTrophySuite[],
    trophies: Trophy[],
    earnedTrophies: EarnedTrophy[],
    trophySuiteGroups: TrophySuiteGroup[],
) {
    return {
        players: buildTrophyQuestPlayer(players),
        games: buildTrophyQuestGames(playedGames),
        gameImages: buildTrophyQuestGameImages(playedGames),
        trophySuites: buildTrophyQuestTrophySuites(playedTrophySuites),
        trophySuiteGroups: buildTrophyQuestTrophySuiteGroups(trophySuiteGroups),
        trophies: buildTrophyQuestTrophies(trophies),
        playedGames: buildTrophyQuestPlayedGames(accountId, playedGames),
        playedTrophySuites: buildTrophyQuestPlayedTrophySuites(accountId, playedTrophySuites),
        earnedTrophies: buildTrophyQuestEarnedTrophies(accountId, earnedTrophies),
    } as TrophyQuestData
}