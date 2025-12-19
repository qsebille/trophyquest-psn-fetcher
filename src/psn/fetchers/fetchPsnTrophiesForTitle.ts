import {PsnTitle} from "../models/psnTitle.js";
import {PsnAuthTokens} from "../../auth/psnAuthTokens.js";
import {PsnTrophy} from "../models/psnTrophy.js";

export async function fetchPsnTrophiesForTitle(
    psnTitle: PsnTitle,
    psnAuthTokens: PsnAuthTokens
): Promise<PsnTrophy[]> {
    const {getTitleTrophies} = await import("psn-api");

    let options = {};
    if (psnTitle.platform !== "PS5") {
        options = {npServiceName: "trophy"};
    }
    const titleTrophies = await getTitleTrophies(psnAuthTokens, psnTitle.id, "all", options);

    return titleTrophies.trophies.map(trophy => {
        return {
            id: `${psnTitle.id}-${trophy.trophyId}`,
            rank: trophy.trophyId,
            title: trophy.trophyName,
            detail: trophy.trophyDetail,
            titleId: psnTitle.id,
            isHidden: trophy.trophyHidden,
            trophyType: trophy.trophyType,
            iconUrl: trophy.trophyIconUrl,
            groupId: trophy.trophyGroupId,
        } as PsnTrophy;
    });
}