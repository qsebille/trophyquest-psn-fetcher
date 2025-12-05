import {PsnTitle} from "./psnTitle.js";
import {PsnTrophySet} from "./psnTrophySet.js";
import {PsnTitleTrophySet} from "./psnTitleTrophySet.js";

export interface PsnTitlesTrophySetResponse {
    titles: PsnTitle[];
    trophySets: PsnTrophySet[];
    links: PsnTitleTrophySet[];
}