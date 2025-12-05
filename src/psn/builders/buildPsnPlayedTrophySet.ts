import {PsnUser} from "../models/psnUser.js";
import {PsnTrophySet} from "../models/psnTrophySet.js";
import {PsnPlayedTrophySet} from "../models/psnPlayedTrophySet.js";

export function buildPsnPlayedTrophySet(
    psnUser: PsnUser,
    trophySets: PsnTrophySet[]
): PsnPlayedTrophySet[] {
    return trophySets.map(trophySet => ({userId: psnUser.id, trophySetId: trophySet.id}));
}