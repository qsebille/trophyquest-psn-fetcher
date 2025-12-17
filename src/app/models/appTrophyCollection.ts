import {PsnTrophySet} from "../../psn/models/psnTrophySet.js";
import {PsnTitleTrophySet} from "../../psn/models/psnTitleTrophySet.js";
import {SchemaIdMap} from "./staging/schemaIdMap.js";

export interface AppTrophyCollection {
    id: string;
    game_id: string;
    title: string;
    platform: string;
    image_url: string;
}

export function buildAppTrophyCollections(
    psnTrophySetList: PsnTrophySet[],
    psnTitleTrophySetList: PsnTitleTrophySet[],
    schemaIdMap: SchemaIdMap,
): AppTrophyCollection[] {
    const appTrophyCollections: AppTrophyCollection[] = [];
    for (const link of psnTitleTrophySetList) {
        const trophySet = psnTrophySetList.find(t => t.id === link.trophySetId)!;
        if (!trophySet) {
            console.error(`Build App Trophy Collection: Could not find trophy set with ID ${link.trophySetId} in title/trophy set links.`);
            process.exit(1);
        }
        const trophyCollectionId = schemaIdMap.collections.get(link.trophySetId);
        if (!trophyCollectionId) {
            console.error(`Build App Trophy Collection: Could not find trophy set with ID ${link.trophySetId} in schema-id-map.`);
            process.exit(1);
        }
        const gameId = schemaIdMap.games.get(link.titleId);
        if (!gameId) {
            console.error(`Build App Trophy Collection: Could not find title with ID ${link.titleId} in schema-id-map.`);
            process.exit(1);
        }

        appTrophyCollections.push({
            id: trophyCollectionId,
            game_id: gameId,
            title: trophySet.name,
            platform: trophySet.platform,
            image_url: trophySet.iconUrl
        });
    }

    return appTrophyCollections;
}