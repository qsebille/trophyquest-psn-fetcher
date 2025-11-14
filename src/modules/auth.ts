const {
    exchangeNpssoForAccessCode,
    exchangeAccessCodeForAuthTokens,
    exchangeRefreshTokenForAuthTokens
} = await import("psn-api")

export type Auth = {
    accessToken: string;
    refreshToken: string;
};

export async function authRefresh(authRefreshToken: string) {
    return exchangeRefreshTokenForAuthTokens(authRefreshToken);
}

export async function authFromNpsso(npsso: string) {
    const accessCode = await exchangeNpssoForAccessCode(npsso);
    const auth = await exchangeAccessCodeForAuthTokens(accessCode);
    return auth;
}