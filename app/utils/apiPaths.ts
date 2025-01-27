
/*
{
    "copyright": "Copyright 2025 MLB Advanced Media, L.P.  Use of any content on this page acknowledges agreement to the terms posted here http://gdx.mlb.com/components/copyright.txt",
    "totalItems": 2998,
    "totalEvents": 0,
    "totalGames": 2998,
    "totalGamesInProgress": 0,
    "dates": [
        {
            "date": "2024-02-22",
            "totalItems": 1,
            "totalEvents": 0,
            "totalGames": 1,
            "totalGamesInProgress": 0,
            "games": [
                {
                    "gamePk": 748266,
                    "gameGuid": "d5cb4300-04fc-4cd0-9a62-88099e61bd81",
                    "link": "/api/v1.1/game/748266/feed/live",
                    "gameType": "S",
                    "season": "2024",
                    "gameDate": "2024-02-22T20:10:00Z",
                    "officialDate": "2024-02-22",
                    "status": {
                        "abstractGameState": "Final",
                        "codedGameState": "F",
                        "detailedState": "Final",
                        "statusCode": "F",
                        "startTimeTBD": false,
                        "abstractGameCode": "F"
                    },
                    "teams": {
                        "away": {
                            "leagueRecord": {
                                "wins": 1,
                                "losses": 0,
                                "pct": "1.000"
                            },
                            "score": 14,
                            "team": {
                                "id": 119,
                                "name": "Los Angeles Dodgers",
                                "link": "/api/v1/teams/119"
                            },
                            "isWinner": true,
                            "splitSquad": false,
                            "seriesNumber": 1
                        },
                        "home": {
                            "leagueRecord": {
                                "wins": 0,
                                "losses": 1,
                                "pct": ".000"
                            },
                            "score": 1,
                            "team": {
                                "id": 135,
                                "name": "San Diego Padres",
                                "link": "/api/v1/teams/135"
                            },
                            "isWinner": false,
                            "splitSquad": false,
                            "seriesNumber": 1
                        }
                    },
                    "venue": {
                        "id": 2530,
                        "name": "Peoria Stadium",
                        "link": "/api/v1/venues/2530"
                    },
                    "content": {
                        "link": "/api/v1/game/748266/content"
                    },
                    "isTie": false,
                    "gameNumber": 1,
                    "publicFacing": true,
                    "doubleHeader": "N",
                    "gamedayType": "N",
                    "tiebreaker": "N",
                    "calendarEventID": "14-748266-2024-02-22",
                    "seasonDisplay": "2024",
                    "dayNight": "day",
                    "scheduledInnings": 9,
                    "reverseHomeAwayStatus": false,
                    "inningBreakLength": 145,
                    "gamesInSeries": 2,
                    "seriesGameNumber": 1,
                    "seriesDescription": "Spring Training",
                    "recordSource": "S",
                    "ifNecessary": "N",
                    "ifNecessaryDescription": "Normal Game"
                }
            ],
            "events": []
        },
*/

const getGamesBySeason = async (year = '2024') => {
// TODO: Can add scheduled games on home page that are coming up: schedule_endpoint_url = 'https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=2024'
// can search for 2025, also a link for live feed to show a schedule. When a game is clicked, can then call full data.
    try {
        const res = await fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&season=${year}`);
        const data = await res.json();
        return data;
    } catch (error) {
        console.error(`An error occurred fetching the games by season: ${error}`);
    }
}

const getLatestGameId: any = async (year = '2025') => {
    const data = await getGamesBySeason(year);
    const scheduleDates = data.dates;
    const games = scheduleDates.flatMap((date: any) => date.games);
    const latestGamePk = games[games.length - 1].gamePk;

    return latestGamePk;
}

/*
  "copyright": "Copyright 2025 MLB Advanced Media, L.P.  Use of any content on this page acknowledges agreement to the terms posted here http://gdx.mlb.com/components/copyright.txt",
    "gamePk": 778869,
    "link": "/api/v1.1/game/778869/feed/live",
    "metaData": {
        "wait": 10,
        "timeStamp": "20250117_194630",
        "gameEvents": [],
        "logicalEvents": []
    },
    "gameData": {
        "game": {
            "pk": 778869,
            "type": "S",
            "doubleHeader": "N",
            "id": "2025/02/20/chnmlb-lanmlb-1",
            "gamedayType": "E",
            "tiebreaker": "N",
            "gameNumber": 1,
            "calendarEventID": "14-778869-2025-02-20",
            "season": "2025",
            "seasonDisplay": "2025"
        },
        "datetime": {
            "dateTime": "2025-02-20T20:05:00Z",
            "originalDate": "2025-02-20",
            "officialDate": "2025-02-20",
            "dayNight": "day",
            "time": "1:05",
            "ampm": "PM"
*/
const getGameFeed = async (gameId?: any, year = '2024') => {
    let gamePk = gameId;
    if (!gamePk) gamePk = await getLatestGameId(year); // take latest game by default for given year

    try {
        const res = await fetch(`https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`);
        const data = await res.json();
        return data;
    } catch (error) {
        console.error(`There was an error fetching the game feed: ${error}`);
    }
}

/*
{'result': {'type': 'atBat',
  'event': 'Strikeout',
  'eventType': 'strikeout',
  'description': 'Alex Verdugo strikes out swinging.',
  'rbi': 0,
  'awayScore': 7,
  'homeScore': 6,
  'isOut': True},
 'about': {'atBatIndex': 88,
  'halfInning': 'bottom',
  'isTopInning': False,
  'inning': 9,
  'startTime': '2024-10-31T03:50:09.726Z',
  'endTime': '2024-10-31T03:51:22.288Z',
  'isComplete': True,
  'isScoringPlay': False,
  'hasReview': False,
  'hasOut': True,
  'captivatingIndex': 14},
 'count': {'balls': 1, 'strikes': 3, 'outs': 3},
 'matchup': {'batter': {'id': 657077,
   'fullName': 'Alex Verdugo',
   'link': '/api/v1/people/657077'},
  'batSide': {'code': 'L', 'description': 'Left'},
  'pitcher': {'id': 621111,
   'fullName': 'Walker Buehler',
   'link': '/api/v1/people/621111'},
  'pitchHand': {'code': 'R', 'description': 'Right'},
  'batterHotColdZones': [],
  'pitcherHotColdZones': [],
  'splits': {'batter': 'vs_RHP', 'pitcher': 'vs_LHB', 'menOnBase': 'Empty'}},
 'pitchIndex': [0, 1, 2, 3],
 'actionIndex': [],
 'runnerIndex': [0],
 'runners': [{'movement': {'originBase': None,
    'start': None,
    'end': None,
    'outBase': '1B',
    'isOut': True,
    'outNumber': 3},
   'details': {'event': 'Strikeout',
    'eventType': 'strikeout',
    'movementReason': None,
    'runner': {'id': 657077,
     'fullName': 'Alex Verdugo',
     'link': '/api/v1/people/657077'},
    'responsiblePitcher': None,
    'isScoringEvent': False,
    'rbi': False,
    'earned': False,
    'teamUnearned': False,
    'playIndex': 3},
   'credits': [{'player': {'id': 669257, 'link': '/api/v1/people/669257'},
     'position': {'code': '2',
      'name': 'Catcher',
      'type': 'Catcher',
      'abbreviation': 'C'},
     'credit': 'f_putout'}]}],
 'playEvents': [{'details': {'call': {'code': 'B', 'description': 'Ball'},
    'description': 'Ball',
    'code': 'B',
    'ballColor': 'rgba(39, 161, 39, 1.0)',
*/
const getSingleGamePlay = async (gameId?: any, year = '2024') => {
    const data = await getGameFeed(gameId, year);
    const singleGamePlay = data.liveData.plays.currentPlay;

    return singleGamePlay;
}

const getSingleGamePlayId = async (gameId?: any, year = '2024') => {
    const singleGamePlay = await getSingleGamePlay(gameId, year);

    const singleGamePlayId = singleGamePlay['playEvents'][singleGamePlay['playEvents'].length - 1]['playId'];

    return singleGamePlayId;
}

const getSingleGamePlayVideo = async () => {
    const singleGamePlayId = await getSingleGamePlayId();

    return `https://www.mlb.com/video/search?q=playid=\"${singleGamePlayId}\"`;
};


const getCaptionData = async () => {
    try {
        const res = await fetch('/api/getCaptionData');
        const data = await res.text();
        return data;
    } catch (error) {
        console.error(`There was an error fetching the caption data: ${error}`);
    }
}

/*
 {
            "id": 660271,
            "fullName": "Shohei Ohtani",
            "link": "/api/v1/people/660271",
            "firstName": "Shohei",
            "lastName": "Ohtani",
            "primaryNumber": "17",
            "birthDate": "1994-07-05",
            "currentAge": 30,
            "birthCity": "Oshu",
            "birthCountry": "Japan",
            "height": "6' 4\"",
            "weight": 210,
            "active": true,
            "primaryPosition": {
                "code": "Y",
                "name": "Two-Way Player",
                "type": "Two-Way Player",
                "abbreviation": "TWP"
            },
            "useName": "Shohei",
            "useLastName": "Ohtani",
            "boxscoreName": "Ohtani",
            "nickName": "Showtime",
            "gender": "M",
            "isPlayer": true,
            "isVerified": false,
            "pronunciation": "show-HEY oh-TAWN-ee",
            "mlbDebutDate": "2018-03-29",
            "batSide": {
                "code": "L",
                "description": "Left"
            },
            "pitchHand": {
                "code": "R",
                "description": "Right"
            },
            "nameFirstLast": "Shohei Ohtani",
            "nameSlug": "shohei-ohtani-660271",
            "firstLastName": "Shohei Ohtani",
            "lastFirstName": "Ohtani, Shohei",
            "lastInitName": "Ohtani, S",
            "initLastName": "S Ohtani",
            "fullFMLName": "Shohei Ohtani",
            "fullLFMName": "Ohtani, Shohei",
            "strikeZoneTop": 3.4,
            "strikeZoneBottom": 1.62
        }
*/
const fetchFollowedPlayers = async (playerId: string) => {
    try {
        const res = await fetch(`https://statsapi.mlb.com/api/v1/people/${playerId}`);
        const data = await res.json();
        const player = data.people[0];

        return player;

    } catch (error) {
        console.error(`Failed to fetch data for player ${playerId}`, error);
    }
}

const getPlayerHeadshot = (playerId: string) => {
    return `https://securea.mlb.com/mlb/images/players/head_shot/${playerId}.jpg`;
}

const getVideoThumbnail = async(videoUrl: string) => {
    try {
        const res = await fetch('/api/getVideoThumbnail');
        const data = await res.text();

        return data;

    } catch (error) {
        console.error(`Error getting videoThumbnail: ${error}`);
    }
}

/*
   {
            "id": 671096,
            "fullName": "Andrew Abbott",
            "link": "/api/v1/people/671096",
            "firstName": "Andrew",
            "lastName": "Abbott",
            "primaryNumber": "41",
            "birthDate": "1999-06-01",
            "currentAge": 25,
            "birthCity": "Lynchburg",
            "birthStateProvince": "VA",
            "birthCountry": "USA",
            "height": "6' 0\"",
            "weight": 192,
            "active": true,
            "currentTeam": {
                "id": 113,
                "link": "/api/v1/teams/113"
            },
            "primaryPosition": {
                "code": "1",
                "name": "Pitcher",
                "type": "Pitcher",
                "abbreviation": "P"
            },
            "useName": "Andrew",
            "useLastName": "Abbott",
            "middleName": "Cole",
            "boxscoreName": "Abbott, A",
            "gender": "M",
            "isPlayer": true,
            "isVerified": true,
            "draftYear": 2021,
            "mlbDebutDate": "2023-06-05",
            "batSide": {
                "code": "L",
                "description": "Left"
            },
            "pitchHand": {
                "code": "L",
                "description": "Left"
            },
            "nameFirstLast": "Andrew Abbott",
            "nameSlug": "andrew-abbott-671096",
            "firstLastName": "Andrew Abbott",
            "lastFirstName": "Abbott, Andrew",
            "lastInitName": "Abbott, A",
            "initLastName": "A Abbott",
            "fullFMLName": "Andrew Cole Abbott",
            "fullLFMName": "Abbott, Andrew Cole",
            "strikeZoneTop": 3.37,
            "strikeZoneBottom": 1.54
        },
*/
const fetchPlayers = async (season?: number, fields?: string) => {

    let queryUrl = 'https://statsapi.mlb.com/api/v1/sports/1/players';

    if (season || fields) queryUrl += '?';

    if (season) queryUrl += `season=${season}`;

    if (season && fields) queryUrl += '&';

    if (fields) queryUrl += `fields=${fields}`;

    try {
        const res = await fetch(queryUrl);
        const data = await res.json();
        const players = data.people;

        return players;

    } catch (error) {
        console.error(`Error getting players: ${error}`);
    }
}

const getTeamLogo = (teamId: string) => {
    return `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
}


/* Example data:

 "id": 103,
            "name": "American League",
            "link": "/api/v1/league/103",
            "abbreviation": "AL",
            "nameShort": "American",
            "seasonState": "preseason",
            "hasWildCard": true,
            "hasSplitSeason": false,
            "numGames": 162,
            "hasPlayoffPoints": false,
            "numTeams": 15,
            "numWildcardTeams": 3,
            "seasonDateInfo": {
                "seasonId": "2025",
                "preSeasonStartDate": "2025-01-01",
                "preSeasonEndDate": "2025-02-19",
                "seasonStartDate": "2025-02-20",
                "springStartDate": "2025-02-20",
                "springEndDate": "2025-03-25",
                "regularSeasonStartDate": "2025-03-26",
                "lastDate1stHalf": "2025-07-14",
                "allStarDate": "2025-07-15",
                "firstDate2ndHalf": "2025-07-19",
                "regularSeasonEndDate": "2025-09-28",
                "postSeasonStartDate": "2025-09-30",
                "postSeasonEndDate": "2025-10-31",
                "seasonEndDate": "2025-10-31",
                "offseasonStartDate": "2025-11-01",
                "offSeasonEndDate": "2025-12-31",
                "seasonLevelGamedayType": "P",
                "gameLevelGamedayType": "P",
                "qualifierPlateAppearances": 3.1,
                "qualifierOutsPitched": 3.0
            },
            "season": "2025",
            "orgCode": "AL",
            "conferencesInUse": false,
            "divisionsInUse": true,
            "sport": {
                "id": 1,
                "link": "/api/v1/sports/1"
            },
            "sortOrder": 21,
            "active": true
        },

*/
const getMLBLeagues = async () => {

    const queryUrl = 'https://statsapi.mlb.com/api/v1/league?sportId=1';

    try {
        const res = await fetch(queryUrl);
        const data = await res.json()

        return data;

    } catch (error) {
        console.error(`Error getting players: ${error}`);
    }
}

/*
 {
            "seasonId": "1876",
            "hasWildcard": false,
            "preSeasonStartDate": "1876-01-01",
            "seasonStartDate": "1876-04-22",
            "regularSeasonStartDate": "1876-04-22",
            "regularSeasonEndDate": "1876-10-09",
            "seasonEndDate": "1876-10-09",
            "offseasonStartDate": "1876-10-10",
            "offSeasonEndDate": "1877-04-29",
            "seasonLevelGamedayType": "S",
            "gameLevelGamedayType": "S",
            "qualifierPlateAppearances": 3.1,
            "qualifierOutsPitched": 3.0
        },

        &withGameTypeDates=true" at end to get much more info on games
*/

const getMLBSeasons = async (setGameTypesData: boolean) => {

    let queryUrl = 'https://statsapi.mlb.com/api/v1/seasons/all?sportId=1';

    if (setGameTypesData) queryUrl += '&withGameTypeDates=true';

    try {
        const res = await fetch(queryUrl);
        const data = await res.json();

        return data;

    } catch (error) {
        console.error(`Error getting players: ${error}`);
    }
}

/*
   {
            "springLeague": {
                "id": 114,
                "name": "Cactus League",
                "link": "/api/v1/league/114",
                "abbreviation": "CL"
            },
            "allStarStatus": "N",
            "id": 133,
            "name": "Athletics",
            "link": "/api/v1/teams/133",
            "season": 2025,
            "venue": {
                "id": 2529,
                "name": "Sutter Health Park",
                "link": "/api/v1/venues/2529"
            },
            "springVenue": {
                "id": 2507,
                "link": "/api/v1/venues/2507"
            },
            "teamCode": "ath",
            "fileCode": "ath",
            "abbreviation": "ATH",
            "teamName": "Athletics",
            "locationName": "Sacramento",
            "firstYearOfPlay": "1901",
            "league": {
                "id": 103,
                "name": "American League",
                "link": "/api/v1/league/103"
            },
            "division": {
                "id": 200,
                "name": "American League West",
                "link": "/api/v1/divisions/200"
            },
            "sport": {
                "id": 1,
                "link": "/api/v1/sports/1",
                "name": "Major League Baseball"
            },
            "shortName": "Athletics",
            "franchiseName": "Athletics",
            "clubName": "Athletics",
            "active": true
        },
*/

const getMLBTeams = async () => {

    const queryUrl = 'https://statsapi.mlb.com/api/v1/teams?sportId=1';

    try {
        const res = await fetch(queryUrl);
        const data = await res.json();

        return data.teams;

    } catch (error) {
        console.error(`Error getting players: ${error}`);
    }
}

/*
 {
            "person": {
                "id": 681911,
                "fullName": "Alex Vesia",
                "link": "/api/v1/people/681911"
            },
            "jerseyNumber": "51",
            "position": {
                "code": "1",
                "name": "Pitcher",
                "type": "Pitcher",
                "abbreviation": "P"
            },
            "status": {
                "code": "A",
                "description": "Active"
            },
            "parentTeamId": 119
        },
        {
            "person": {
                "id": 681624,
                "fullName": "Andy Pages",
                "link": "/api/v1/people/681624"
            },
            "jerseyNumber": "44",
            "position": {
                "code": "8",
                "name": "Outfielder",
                "type": "Outfielder",
                "abbreviation": "CF"
            },
            "status": {
                "code": "A",
                "description": "Active"
            },
            "parentTeamId": 119
        },
*/
const getMLBTeamRoster = async (teamId: string, season: string = '2025') => {
    const queryUrl = `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster?season=${season}`;

    try {
        const res = await fetch(queryUrl);
        const data = await res.json();

        return data.roster;

    } catch (error) {
        console.error(`Error getting players: ${error}`);
    }
}

export { getMLBTeamRoster, getMLBTeams, getMLBSeasons, getMLBLeagues, fetchPlayers, fetchFollowedPlayers, getGamesBySeason, getGameFeed, getLatestGameId, getSingleGamePlay, getSingleGamePlayId, getSingleGamePlayVideo, getCaptionData, getPlayerHeadshot, getVideoThumbnail, getTeamLogo }