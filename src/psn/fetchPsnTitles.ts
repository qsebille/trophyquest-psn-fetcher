import {PsnAuthTokens} from "../auth/psnAuthTokens.js";
import {PsnTitle} from "./models/psnTitle.js";

const TITLE_SEARCH_LIMIT: number = 200;

/**
 * Fetches the titles played by a PlayStation user.
 *
 * @param {PsnAuthTokens} psnAuthTokens - Authentication tokens required to access PSN API.
 * @param {string} accountId - The unique account ID of the PlayStation user.
 * @return {Promise<PsnTitle[]>} A promise that resolves to an array of PlayStation titles played by the user.
 */
export async function fetchPsnTitles(psnAuthTokens: PsnAuthTokens, accountId: string): Promise<PsnTitle[]> {
    // @ts-ignore
    const {getUserPlayedGames} = await import("psn-api");

    let offset = 0;
    let result: PsnTitle[] = [];
    while (true) {
        const options = {limit: TITLE_SEARCH_LIMIT, offset}
        const userPlayedGamesResponse = await getUserPlayedGames(psnAuthTokens, accountId, options);
        const pagePsnTitles: PsnTitle[] = userPlayedGamesResponse.titles
            // @ts-ignore
            .filter(t => t.category === 'ps4_game' || t.category === 'ps5_native_game' || t.category === 'unknown')
            // @ts-ignore
            .map(title => {
                return {
                    id: title.titleId,
                    name: title.name,
                    imageUrl: title.imageUrl,
                    category: title.category,
                    lastPlayedDateTime: title.lastPlayedDateTime,
                }
            });
        result.push(...pagePsnTitles);

        if (!userPlayedGamesResponse.nextOffset || userPlayedGamesResponse.nextOffset > userPlayedGamesResponse.totalItemCount) break;
        offset = userPlayedGamesResponse.nextOffset;
    }

    return result;
}