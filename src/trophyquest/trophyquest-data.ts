import {buildTrophyQuestPlayer, TrophyQuestPlayer} from "./player";
import {buildTrophyQuestGroups, TrophyQuestGroup} from "./group";
import {buildTrophyQuestSuites, TrophyQuestSuite} from "./trophy-suite";
import {buildTrophyQuestTrophies, TrophyQuestTrophy} from "./trophy";
import {buildTrophyQuestPlayedSuites, TrophyQuestPlayedSuite} from "./played-suite";
import {buildTrophyQuestEarnedTrophies, TrophyQuestEarnedTrophy} from "./earned-trophy";
import {Trophy} from "../psn/trophy/trophy.model";
import {EarnedTrophy} from "../psn/trophy/earned-trophy.model";
import {TrophySuiteGroup} from "../psn/trophy/trophy-suite-group.model";
import {Player} from "../psn/player/player.model";
import {PlayedSuite} from "../psn/played-suite";

export interface TrophyQuestData {
    players: TrophyQuestPlayer[]
    suites: TrophyQuestSuite[]
    groups: TrophyQuestGroup[]
    trophies: TrophyQuestTrophy[]
    playedSuites: TrophyQuestPlayedSuite[]
    earnedTrophies: TrophyQuestEarnedTrophy[]
}

export function buildTrophyquestPlayerData(
    accountId: string,
    players: Player[],
    playedSuites: PlayedSuite[],
    trophies: Trophy[],
    earnedTrophies: EarnedTrophy[],
    trophySuiteGroups: TrophySuiteGroup[],
) {
    return {
        players: buildTrophyQuestPlayer(players),
        suites: buildTrophyQuestSuites(playedSuites),
        groups: buildTrophyQuestGroups(trophySuiteGroups),
        trophies: buildTrophyQuestTrophies(trophies),
        playedSuites: buildTrophyQuestPlayedSuites(accountId, playedSuites),
        earnedTrophies: buildTrophyQuestEarnedTrophies(accountId, earnedTrophies),
    } as TrophyQuestData
}