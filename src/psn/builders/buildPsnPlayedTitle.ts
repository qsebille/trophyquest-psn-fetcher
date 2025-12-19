import {PsnUser} from "../models/psnUser.js";
import {PsnTitle} from "../models/psnTitle.js";
import {PsnPlayedTitle} from "../models/psnPlayedTitle.js";

export function buildPsnPlayedTitle(
    psnUser: PsnUser,
    psnTitleList: PsnTitle[]
): PsnPlayedTitle[] {
    return psnTitleList.map(t => ({
        userId: psnUser.id,
        titleId: t.id,
        lastPlayedDateTime: t.lastUpdatedDateTime
    }));
}