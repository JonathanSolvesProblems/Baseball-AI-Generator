enum Stat {
    WinProbability = "winProbability",
    BoxScore = "boxscore"
}

const getGameStat = async (gamePk: string, stat: Stat, timeCode?: string) => {

    
    let endpoint = `https://statsapi.mlb.com/api/v1/game/${gamePk}/${stat}`;

    if (timeCode) endpoint += `?timecode=${timeCode}`;

    try {
        const res = await fetch(endpoint);
        const data = await res.json();

        return data;

    } catch (error) {
        console.error(`Failed to fetch game probability of gamePk ${gamePk} for stat ${stat}: ${error}`);
    }
}

export { getGameStat }