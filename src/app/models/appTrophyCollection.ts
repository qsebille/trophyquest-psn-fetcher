import {TrophyCollectionStaging} from "./staging/trophyCollectionStaging.js";

export interface AppTrophyCollection {
    id: string;
    game_id: string;
    title: string;
    platform: string;
    image_url: string;
}

export function buildAppTrophyCollections(staging: TrophyCollectionStaging[]): AppTrophyCollection[] {
    return staging.map(trophyCollection => ({
        id: trophyCollection.trophyCollectionAppUuid,
        game_id: trophyCollection.gameAppUuid,
        title: trophyCollection.name,
        platform: trophyCollection.platform,
        image_url: trophyCollection.imageUrl
    }));
}