import {PsnPlayedTrophySet} from "../../psn/models/psnPlayedTrophySet.js";
import {UserStaging} from "./staging/userStaging.js";
import {TrophyCollectionStaging} from "./staging/trophyCollectionStaging.js";

export interface AppPlayedTrophyCollection {
    player_id: string;
    trophy_collection_id: string;
}

export function buildAppPlayedTrophyCollections(
    psnPlayedTrophySets: PsnPlayedTrophySet[],
    userStaging: UserStaging[],
    trophyCollectionStaging: TrophyCollectionStaging[],
): AppPlayedTrophyCollection[] {
    const userStagingByPsnId = new Map<string, UserStaging>(userStaging.map(u => [u.userPsnId, u]));
    const trophyCollectionStagingByPsnId = new Map<string, TrophyCollectionStaging>(trophyCollectionStaging.map(c => [c.psnTrophySetId, c]));

    const appUserTrophyCollections: AppPlayedTrophyCollection[] = [];
    const collectionIds = new Set<String>();
    for (const playedTrophySet of psnPlayedTrophySets) {
        const user = userStagingByPsnId.get(playedTrophySet.userId);
        const trophyCollection = trophyCollectionStagingByPsnId.get(playedTrophySet.trophySetId);

        if (!user || !trophyCollection) {
            continue;
        }
        const id = `${user.userAppId}-${trophyCollection.trophyCollectionAppUuid}`;
        if (!collectionIds.has(id)) {
            appUserTrophyCollections.push({
                player_id: user.userAppId,
                trophy_collection_id: trophyCollection.trophyCollectionAppUuid,
            });
            collectionIds.add(id);
        }
    }

    return appUserTrophyCollections;
}