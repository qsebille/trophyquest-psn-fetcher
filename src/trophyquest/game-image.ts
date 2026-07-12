import {computeTrophyQuestGameUuid} from "../utils/uuid";
import {PlayedGame} from "../psn/game/played-game.model";

export interface TrophyQuestGameImage {
    psnUrl: string
    type: string
    format: string
    gameId: string
}

export function buildTrophyQuestGameImages(games: PlayedGame[]) {
    const images: TrophyQuestGameImage[] = [];

    games.map(game => {
        const gameId = computeTrophyQuestGameUuid(game.conceptId)

        const currentGameImages = game.images.map(
            image => {
                return {
                    psnUrl: image.url,
                    format: image.format,
                    type: image.type,
                    gameId,
                } as TrophyQuestGameImage
            }
        )
        images.push(...currentGameImages);
    });

    return images;
}