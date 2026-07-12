export interface TrophySuiteGroup {
    id: string,
    trophySuiteId: string,
    psnId: string, // 'default' for base psn.games, otherwise increments '001', '002', etc. for each DLC
    name: string,
}