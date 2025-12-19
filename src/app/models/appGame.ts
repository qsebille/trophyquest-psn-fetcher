import {PsnTitle} from "../../psn/models/psnTitle.js";
import {computeGameUuid} from "../utils/uuid.js";

export interface AppGame {
    id: string;
    title: string;
    platform: string;
    imageUrl: string;
}

export function buildAppGames(psnTitleList: PsnTitle[]): AppGame[] {
    return psnTitleList.map(t => {
        return {
            id: computeGameUuid(t.id),
            title: t.name,
            platform: t.platform,
            imageUrl: t.iconUrl
        };
    });
}