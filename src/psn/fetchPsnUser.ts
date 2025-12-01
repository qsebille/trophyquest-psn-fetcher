import {PsnUser} from "./models/psnUser.js";
import {PsnAuthTokens} from "../auth/psnAuthTokens.js";

/**
 * Fetches the PlayStation Network (PSN) user profile based on the provided authentication tokens and profile name.
 *
 * @param {PsnAuthTokens} psnAuthTokens - The authentication tokens required to access the PSN API.
 * @param {string | undefined} profileName - The profile name of the PSN user. If undefined, defaults to "me".
 * @return {Promise<PsnUser>} A promise that resolves to a `PsnUserDto` containing the user's ID, profile name, and avatar URL.
 */
export async function fetchPsnUser(
    psnAuthTokens: PsnAuthTokens,
    profileName: string | undefined
): Promise<PsnUser> {
    // @ts-ignore
    const {getProfileFromUserName} = await import("psn-api");

    let usedProfileName: string
    if (!profileName) {
        console.info("No PROFILE_NAME provided, using 'me' as account");
        usedProfileName = "me";
    } else {
        usedProfileName = profileName.toString();
    }

    const userPsn = await getProfileFromUserName(psnAuthTokens, usedProfileName);
    return {
        id: userPsn.profile.accountId,
        profileName: userPsn.profile.onlineId,
        avatarUrl: userPsn.profile.avatarUrls[0]?.avatarUrl ?? null
    };
}