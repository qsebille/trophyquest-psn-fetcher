import {v5 as uuidv5} from "uuid";

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
const NS_TROPHIES = "b79f0e2d-9b33-4a7e-9e4a-0d4e2a9b7c11";

export function userUuid(accountId: string) {
    return uuidv5(`${normalize(accountId)}`, NS_GAMES);
}

export function gameUuid(gameTitle: string, gamePlatform: string) {
    return uuidv5(`${normalize(gameTitle)}|${normalize(gamePlatform)}`, NS_GAMES);
}

export function trophyUuid(gameUuid: string, trophyId: number) {
    return uuidv5(`${gameUuid}|${trophyId}`, NS_TROPHIES);
}
