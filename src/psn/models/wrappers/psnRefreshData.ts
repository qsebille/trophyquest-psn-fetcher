import {PsnUser} from "../psnUser.js";
import {PsnTitle} from "../psnTitle.js";
import {PsnTrophySet} from "../psnTrophySet.js";
import {PsnTitleTrophySet} from "../psnTitleTrophySet.js";
import {PsnUserPlayedTitle} from "../psnUserPlayedTitle.js";
import {PsnTrophy} from "../psnTrophy.js";
import {PsnEarnedTrophy} from "../psnEarnedTrophy.js";

export type PsnRefreshData = {
    users: PsnUser[];
    titles: PsnTitle[];
    trophySets: PsnTrophySet[];
    titleTrophySets: PsnTitleTrophySet[];
    playedTitles: PsnUserPlayedTitle[];
    trophies: PsnTrophy[];
    earnedTrophies: PsnEarnedTrophy[];
}