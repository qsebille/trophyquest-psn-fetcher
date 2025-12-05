import {TrophyCollectionStaging} from "./staging/trophyCollectionStaging.js";

export interface AppGame {
    id: string,
    title: string,
    image_url: string
}

export function buildAppGames(collectionStaging: TrophyCollectionStaging[]) {
    const gameIds: Set<string> = new Set(collectionStaging.map(g => g.gameAppUuid));
    const games: AppGame[] = [];
    for (const gameId of gameIds) {
        const collection = collectionStaging.filter(g => g.gameAppUuid === gameId)[0];
        games.push({id: gameId, title: collection.name, image_url: collection.imageUrl});
    }

    return games;
}