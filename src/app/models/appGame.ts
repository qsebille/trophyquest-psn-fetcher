import {PsnTitle} from "../../psn/models/psnTitle.js";
import {computeGameUuid} from "../utils/uuid.js";

export interface AppGame {
    id: string,
    title: string,
    image_url: string
}

export function buildAppGames(psnTitleList: PsnTitle[]): AppGame[] {
    return psnTitleList.map(title => {
        return {
            id: computeGameUuid(title),
            title: title.name,
            image_url: title.imageUrl
        }
    });
}