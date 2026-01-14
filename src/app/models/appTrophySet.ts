import {PsnTitle} from "../../psn/models/psnTitle.js";
import {computeTrophySetUuid} from "../utils/uuid.js";

export interface AppTrophySet {
    id: string;
    title: string;
    platform: string;
    imageUrl: string;
}

export function buildAppGames(psnTitleList: PsnTitle[]): AppTrophySet[] {
    return psnTitleList.map(t => {
        return {
            id: computeTrophySetUuid(t.id),
            title: t.name,
            platform: t.platform,
            imageUrl: t.iconUrl
        };
    });
}