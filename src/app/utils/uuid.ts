import {v5 as uuidv5} from "uuid";

/** Namespaces */
const NS_PLAYERS = "3c6f0e43-9a1f-4c9c-8a2a-0e6d6a2b7c55";
const NS_GAMES = "b79f0e2d-9b33-4a7e-9e4a-0d4e2a9b7c11";
const NS_TROPHIES = "d4dc082a-1db2-4571-9740-9f7e657628b7";

export function computeUserUuid(accountId: string) {
    return uuidv5(accountId, NS_PLAYERS);
}

export function computeTrophySetUuid(npCommunicationId: string) {
    return uuidv5(npCommunicationId, NS_GAMES);
}

export function computeTrophyUuid(
    trophyId: string,
    trophyRank: number
) {
    return uuidv5(`${trophyId}-${trophyRank}`, NS_TROPHIES);
}
