import {PsnTrophy} from "./psnTrophy.js";
import {PsnEarnedTrophy} from "./psnEarnedTrophy.js";

export interface PsnTrophyResponse {
    trophies: PsnTrophy[];
    earnedTrophies: PsnEarnedTrophy[];
}