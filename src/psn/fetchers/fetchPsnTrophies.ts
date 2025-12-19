import {PsnAuthTokens} from "../../auth/psnAuthTokens.js";
import {PsnTitle} from "../models/psnTitle.js";
import {PsnTrophy} from "../models/psnTrophy.js";
import {PsnEarnedTrophy} from "../models/psnEarnedTrophy.js";
import {PsnTrophyResponse} from "../models/psnTrophyResponse.js";
import {fetchPsnTrophiesForTitle} from "./fetchPsnTrophiesForTitle.js";
import {fetchPsnEarnedTrophiesForTitle} from "./fetchPsnEarnedTrophiesForTitle.js";
import {mapWithConcurrency} from "../../aws/utils/mapWithConcurrency.js";


type PerSetResult = {
    trophies: PsnTrophy[];
    earnedTrophies: PsnEarnedTrophy[];
};

export async function fetchPsnUserTrophies(
    psnTitleList: PsnTitle[],
    psnAuthTokens: PsnAuthTokens,
    accountId: string,
    concurrency: number,
): Promise<PsnTrophyResponse> {
    const safeConcurrency = Math.max(1, concurrency);

    const perSetResults: PerSetResult[] = await mapWithConcurrency(
        psnTitleList,
        safeConcurrency,
        async (title) => {
            const [trophies, earnedTrophies] = await Promise.all([
                fetchPsnTrophiesForTitle(title, psnAuthTokens),
                fetchPsnEarnedTrophiesForTitle(title, psnAuthTokens, accountId),
            ]);

            return {trophies, earnedTrophies};
        }
    );

    const trophies = perSetResults.flatMap(r => r.trophies);
    const earnedTrophies = perSetResults.flatMap(r => r.earnedTrophies);

    return {trophies, earnedTrophies};
}