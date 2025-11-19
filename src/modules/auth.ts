import {getUserInfo, UserDTO} from "./psn-user.js";
import {Params} from "./utils/params.js";

export type AuthTokens = {
    accessToken: string;
    refreshToken: string;
};

export type AuthData = {
    tokens: AuthTokens;
    userInfo: UserDTO;
    accountId: string;
}

export async function auth(params: Params): Promise<AuthData> {
    let authTokensResponse = await authFromNpsso(params.npsso);
    if (authTokensResponse.error) {
        console.error("Error in auth");
        console.error(authTokensResponse.error);
    }

    let accountId: string;
    let userInfo: UserDTO;
    if (!params.profileName) {
        console.info("No PROFILE_NAME provided, use 'me' as account");
        accountId = "me"
        userInfo = await getUserInfo(authTokensResponse, accountId);
    } else {
        userInfo = await getUserInfo(authTokensResponse, params.profileName);
        accountId = userInfo.id;
        console.info(`Found user ${params.profileName} in PSN (id: ${accountId})`);
    }

    return {
        tokens: authTokensResponse,
        userInfo: userInfo,
        accountId: accountId,
    }
}


async function authFromNpsso(npsso: string) {
    //@ts-ignore
    const {exchangeNpssoForAccessCode, exchangeAccessCodeForAuthTokens} = await import("psn-api");
    const accessCode = await exchangeNpssoForAccessCode(npsso);
    return await exchangeAccessCodeForAuthTokens(accessCode);
}