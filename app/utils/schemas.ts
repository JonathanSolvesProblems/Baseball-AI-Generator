export interface PlayerDetails {
    id: string;
    fullName: string;
    birthCity: string;
    birthCountry: string;
    height: string;
    weight: string;
    primaryPosition: string;
    currentAge: number;
    mlbDebutDate: string;
}

export interface TeamDetails {
    id: string;
    active: string;
    locationName: string;
    teamName: string;
}

export interface PlayerStats {
    exitVelocityAvg: number,
    hitDistanceAvg: number,
    launchAngleAvg: number,
}

export interface ISavedVideos {
    id: string;
    savedDate: any;
    videoName: string;
    videoUrl: string;
    videoSummary: string;
}