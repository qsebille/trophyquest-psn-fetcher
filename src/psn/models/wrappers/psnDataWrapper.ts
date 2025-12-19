import {PsnUser} from "../psnUser.js";
import {PsnTitle} from "../psnTitle.js";
import {PsnTrophy} from "../psnTrophy.js";
import {PsnEarnedTrophy} from "../psnEarnedTrophy.js";
import {PsnPlayedTitle} from "../psnPlayedTitle.js";

export interface PsnDataWrapper {
    users: PsnUser[];
    titles: PsnTitle[];
    trophies: PsnTrophy[];
    playedTitles: PsnPlayedTitle[];
    earnedTrophies: PsnEarnedTrophy[];
}