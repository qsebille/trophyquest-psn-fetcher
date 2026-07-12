import {PlayedGame} from "../psn/game/played-game.model";
import {computeTrophyQuestGameUuid} from "../utils/uuid";

export interface TrophyQuestGame {
    id: string
    name: string
}

export function buildTrophyQuestGames(games: PlayedGame[]) {
    return games.map(game => {
        const gameId = computeTrophyQuestGameUuid(game.conceptId)
        return {
            id: gameId,
            name: game.name,
        } as TrophyQuestGame
    });
}