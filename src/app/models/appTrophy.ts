import {PsnTrophy} from "../../psn/models/psnTrophy.js";
import {SchemaIdMap} from "./staging/schemaIdMap.js";
import {computeTrophyUuid} from "../utils/uuid.js";

export interface AppTrophy {
    id: string;
    trophy_collection_id: string;
    game_group_id: string;
    rank: number;
    title: string;
    description: string;
    trophy_type: string;
    is_hidden: boolean;
    icon_url: string;
}

export function buildAppTrophies(
    psnTrophyList: PsnTrophy[],
    schemaIdMap: SchemaIdMap,
): AppTrophy[] {
    const appTrophies: AppTrophy[] = [];
    for (const trophy of psnTrophyList) {
        const collectionId = schemaIdMap.collections.get(trophy.trophySetId);
        if (!collectionId) {
            console.error(`Build trophy: Could not find trophy set ${trophy.trophySetId} in schema-id-map.`);
            process.exit(1);
        }

        appTrophies.push({
            id: computeTrophyUuid(trophy),
            trophy_collection_id: collectionId,
            game_group_id: trophy.groupId,
            rank: trophy.rank,
            title: trophy.title,
            description: trophy.detail,
            trophy_type: trophy.trophyType,
            is_hidden: trophy.isHidden,
            icon_url: trophy.iconUrl,
        })
    }

    return appTrophies;
}