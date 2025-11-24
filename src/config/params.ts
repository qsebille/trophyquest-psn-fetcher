export type Params = {
    npsso: string;
    profileName: string | undefined;
}


export function getParams(): Params {
    let npsso: string;
    const profileName: string | undefined = process.env.PROFILE_NAME;

    if (process.env.NPSSO === undefined) {
        console.error("NPSSO params must be provided")
        process.exit(1);
    } else {
        npsso = process.env.NPSSO;
    }

    return {npsso, profileName};
}