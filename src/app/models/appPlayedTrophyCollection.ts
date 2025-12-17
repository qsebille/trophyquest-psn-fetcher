import {PsnPlayedTrophySet} from "../../psn/models/psnPlayedTrophySet.js";
import {SchemaIdMap} from "./staging/schemaIdMap.js";

export interface AppPlayedTrophyCollection {
    player_id: string;
    trophy_collection_id: string;
}

export function buildAppPlayedTrophyCollections(
    psnPlayedTrophySetList: PsnPlayedTrophySet[],
    schemaIdMap: SchemaIdMap,
): AppPlayedTrophyCollection[] {
    const appUserTrophyCollections: AppPlayedTrophyCollection[] = [];
    const collectionIds = new Set<String>();
    for (const playedTrophySet of psnPlayedTrophySetList) {
        const playerId = schemaIdMap.players.get(playedTrophySet.userId);
        if (!playerId) {
            console.error(`Build played trophy collection: Could not find user ${playedTrophySet.userId} in schema-id-map.`);
            process.exit(1);
        }
        const collectionId = schemaIdMap.collections.get(playedTrophySet.trophySetId);
        if (!collectionId) {
            console.error(`Build played trophy collection: Could not find trophy set ${playedTrophySet.trophySetId} in schema-id-map.`);
            process.exit(1);
        }

        const id = `${playerId}-${collectionId}`;
        if (!collectionIds.has(id)) {
            appUserTrophyCollections.push({
                player_id: playerId,
                trophy_collection_id: collectionId,
            });
            collectionIds.add(id);
        }
    }

    return appUserTrophyCollections;
}