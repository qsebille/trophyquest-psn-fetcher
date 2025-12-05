import {PsnUser} from "../psnUser.js";
import {PsnTitle} from "../psnTitle.js";
import {PsnTrophySet} from "../psnTrophySet.js";
import {PsnTitleTrophySet} from "../psnTitleTrophySet.js";
import {PsnPlayedTitle} from "../psnPlayedTitle.js";
import {PsnTrophy} from "../psnTrophy.js";
import {PsnEarnedTrophy} from "../psnEarnedTrophy.js";
import {PsnPlayedTrophySet} from "../psnPlayedTrophySet.js";

export interface PsnDataWrapper {
    users: PsnUser[];
    titles: PsnTitle[];
    trophySets: PsnTrophySet[];
    titleTrophySets: PsnTitleTrophySet[];
    trophies: PsnTrophy[];
    playedTitles: PsnPlayedTitle[];
    playedTrophySets: PsnPlayedTrophySet[];
    earnedTrophies: PsnEarnedTrophy[];
}