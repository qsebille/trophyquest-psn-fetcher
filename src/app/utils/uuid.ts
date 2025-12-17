import {v5 as uuidv5} from "uuid";
import {PsnTitle} from "../../psn/models/psnTitle.js";
import {toSlug} from "./toSlug.js";
import {PsnTrophy} from "../../psn/models/psnTrophy.js";
import {PsnUser} from "../../psn/models/psnUser.js";
import {PsnTrophySet} from "../../psn/models/psnTrophySet.js";

function normalize(s: string) {
    return s
        .normalize("NFKD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

/** Namespaces */
const NS_USERS = "3c6f0e43-9a1f-4c9c-8a2a-0e6d6a2b7c55";
const NS_GAMES = "5f1d2b2d-5a5a-4d2d-8f2b-8b5f1a2c7e10";
const NS_TROPHY_COLLECTION = "b79f0e2d-9b33-4a7e-9e4a-0d4e2a9b7c11";
const NS_TROPHIES = "d4dc082a-1db2-4571-9740-9f7e657628b7";

export function computeUserUuid(psnUser: PsnUser) {
    return uuidv5(normalize(psnUser.id), NS_USERS);
}

export function computeGameUuid(psnTitle: PsnTitle) {
    return uuidv5(normalize(toSlug(psnTitle.name)!), NS_GAMES);
}

export function computeTrophyCollectionUuid(
    psnTitle: PsnTitle,
    psnTrophySet: PsnTrophySet,
) {
    const gameId: string = computeGameUuid(psnTitle);
    return uuidv5(`${gameId}_${psnTrophySet.id}`, NS_TROPHY_COLLECTION);
}

export function computeTrophyUuid(trophy: PsnTrophy) {
    return uuidv5(`${normalize(trophy.trophySetId)}-${trophy.rank}`, NS_TROPHIES);
}
