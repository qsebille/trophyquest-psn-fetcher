import {PsnTitle} from "../../../psn/models/psnTitle.js";
import {PsnTrophySet} from "../../../psn/models/psnTrophySet.js";
import {PsnTitleTrophySet} from "../../../psn/models/psnTitleTrophySet.js";
import {computeGameUuid, computeTrophyCollectionUuid} from "../../utils/uuid.js";


export interface TrophyCollectionStaging {
    psnTitleId: string;
    gameAppUuid: string;
    psnTrophySetId: string;
    trophyCollectionAppUuid: string;
    name: string;
    platform: string;
    imageUrl: string;
}

export function buildTrophyCollectionStaging(
    psnTitles: PsnTitle[],
    psnTrophySets: PsnTrophySet[],
    psnTitlesTrophySets: PsnTitleTrophySet[]
): TrophyCollectionStaging[] {
    const titleById = new Map<string, PsnTitle>(psnTitles.map(t => [t.id, t]));
    const trophySetById = new Map<string, PsnTrophySet>(psnTrophySets.map(ts => [ts.id, ts]));

    const collectionStaging: TrophyCollectionStaging[] = [];
    for (const link of psnTitlesTrophySets) {
        const psnTitle = titleById.get(link.titleId);
        const psnTrophySet = trophySetById.get(link.trophySetId);

        if (!psnTitle || !psnTrophySet) {
            continue;
        }

        const gameAppUuid: string = computeGameUuid(psnTitle);
        const trophyCollectionAppUuid: string = computeTrophyCollectionUuid(gameAppUuid, psnTrophySet.id);

        collectionStaging.push({
            psnTitleId: psnTitle.id,
            gameAppUuid,
            psnTrophySetId: psnTrophySet.id,
            trophyCollectionAppUuid,
            name: psnTrophySet.name,
            platform: psnTrophySet.platform,
            imageUrl: psnTrophySet.iconUrl,
        });
    }

    return collectionStaging;
}