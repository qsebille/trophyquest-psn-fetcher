import {PlayedGame} from "../psn/game/played-game.model";
import {computeTrophyQuestGameUuid, computeTrophyQuestPlayerUuid} from "../utils/uuid";

export interface TrophyQuestPlayedGame {
    gameId: string
    playerId: string
    lastPlayedAt: string
}

export function buildTrophyQuestPlayedGames(accountId: string, playedGames: PlayedGame[]) {
    const playerId = computeTrophyQuestPlayerUuid(accountId)
    return playedGames.map(g => {
        const gameId = computeTrophyQuestGameUuid(g.conceptId)
        return {
            gameId,
            playerId,
            lastPlayedAt: g.lastPlayedAt,
        } as TrophyQuestPlayedGame
    });
}