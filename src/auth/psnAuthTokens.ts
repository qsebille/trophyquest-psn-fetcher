export type PsnAuthTokens = {
    accessToken: string;
    refreshToken: string;
};

/**
 * Retrieves PlayStation Network (PSN) authentication tokens using an NPSSO token.
 *
 * @param {string} npsso - The NPSSO token used to authenticate and retrieve the access code and tokens.
 * @return {Promise<PsnAuthTokens>} A promise that resolves to the PSN authentication tokens.
 */
export async function getPsnAuthTokens(npsso: string): Promise<PsnAuthTokens> {
    //@ts-ignore
    const {exchangeNpssoForAccessCode, exchangeAccessCodeForAuthTokens} = await import("psn-api");
    const accessCode = await exchangeNpssoForAccessCode(npsso);
    return await exchangeAccessCodeForAuthTokens(accessCode);
}