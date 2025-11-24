import {PsnTrophy} from "./psnTrophy.js";
import {PsnEarnedTrophy} from "./psnEarnedTrophy.js";

export type PsnTrophyResponse = {
    trophies: PsnTrophy[];
    earnedTrophies: PsnEarnedTrophy[];
}