import {TrophyCollectionStaging} from "./trophyCollectionStaging.js";
import {PsnTrophy} from "../../../psn/models/psnTrophy.js";
import {computeTrophyUuid} from "../../utils/uuid.js";

export interface TrophyStaging {
    trophyPsnId: string;
    trophyAppUuid: string;
    trophyCollectionAppUuid: string;
    gameGroupId: string;
    rank: number;
    title: string;
    detail: string;
    trophyType: string;
    isHidden: boolean;
    iconUrl: string;
}

export function buildTrophyStaging(
    trophyCollectionStaging: TrophyCollectionStaging[],
    psnTrophies: PsnTrophy[],
): TrophyStaging[] {
    const collectionStagingByPsnId = new Map<string, TrophyCollectionStaging>(trophyCollectionStaging.map(c => [c.psnTrophySetId, c]));

    const trophyStaging: TrophyStaging[] = [];
    for (const trophy of psnTrophies) {
        const trophyCollection = collectionStagingByPsnId.get(trophy.trophySetId);
        if (!trophyCollection) {
            continue;
        }

        trophyStaging.push({
            trophyPsnId: trophy.id,
            trophyAppUuid: computeTrophyUuid(trophy),
            trophyCollectionAppUuid: trophyCollection.trophyCollectionAppUuid,
            gameGroupId: trophy.groupId,
            rank: trophy.rank,
            title: trophy.title,
            detail: trophy.detail,
            trophyType: trophy.trophyType,
            isHidden: trophy.isHidden,
            iconUrl: trophy.iconUrl,
        })
    }

    return trophyStaging;
}