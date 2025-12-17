import {PsnDataWrapper} from "../../../psn/models/wrappers/psnDataWrapper.js";
import {computeGameUuid, computeTrophyCollectionUuid, computeTrophyUuid, computeUserUuid} from "../../utils/uuid.js";
import {PsnTitle} from "../../../psn/models/psnTitle.js";
import {PsnTrophySet} from "../../../psn/models/psnTrophySet.js";

export interface SchemaIdMap {
    players: Map<string, string>,
    games: Map<string, string>,
    collections: Map<string, string>,
    trophies: Map<string, string>,
}

export function buildSchemaIdMap(psnDataWrapper: PsnDataWrapper): SchemaIdMap {
    const collectionMap: Map<string, string> = new Map();
    for (const link of psnDataWrapper.titleTrophySets) {
        const psnTitle: PsnTitle = psnDataWrapper.titles.find(t => t.id === link.titleId)!;
        if (!psnTitle) {
            console.error(`Schema ID Map: Could not find title with ID ${link.titleId} in PSN data wrapper links.`);
            process.exit(1);
        }
        const psnTrophySet: PsnTrophySet = psnDataWrapper.trophySets.find(t => t.id === link.trophySetId)!;
        if (!psnTrophySet) {
            console.error(`Schema ID Map: Could not find trophy set with ID ${link.trophySetId} in PSN data wrapper links.`);
            process.exit(1);
        }

        const uuid = computeTrophyCollectionUuid(psnTitle, psnTrophySet);
        collectionMap.set(psnTrophySet.id, uuid);
    }

    return {
        players: new Map(psnDataWrapper.users.map(u => [u.id, computeUserUuid(u)])),
        games: new Map(psnDataWrapper.titles.map(t => [t.id, computeGameUuid(t)])),
        collections: collectionMap,
        trophies: new Map(psnDataWrapper.trophies.map(t => [t.id, computeTrophyUuid(t)])),
    };
}