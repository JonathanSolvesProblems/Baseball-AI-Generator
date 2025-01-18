import Header from "../components/Header";
import { fetchPlayers } from "../utils/apiPaths";
import PlayersTable from "./PlayersTable";

interface Person {
  id: number;
  fullName: string;
}

interface Status {
  description: string;
}

interface Roster {
  person: Person;
  status: Status;
}

interface Game {
  roster: Roster[];
}

// const getCurrentPlay = async () => {
//   // https://www.reddit.com/r/mlbdata/comments/xb5lnh/getting_live_data_from_games/
//   const game_pk = 661848;
//   const res = await fetch(
//     `https://statsapi.mlb.com/api/v1.1/game/${game_pk}/feed/live`
//   );
//   const gameDetails = await res.json();
//   const currentPlay = gameDetails.liveData.plays.currentPlay;

//   return currentPlay;
// };

// const fetchLiveGameData = async () => {
//   const { result, matchup, count, playEvents } = await getCurrentPlay();

//   // Extracting key info about the at-bat and play events
//   const batterName = matchup.batter.fullName;
//   const pitcherName = matchup.pitcher.fullName;
//   const pitchType =
//     playEvents[playEvents.length - 1]?.details?.type.description;
//   const pitchSpeed =
//     playEvents[playEvents.length - 1]?.details?.pitchData?.startSpeed;
//   const countInfo = `Balls: ${count.balls}, Strikes: ${count.strikes}, Outs: ${count.outs}`;
//   const eventDescription = result.description;

//   return {
//     batterName,
//     pitcherName,
//     pitchType,
//     pitchSpeed,
//     countInfo,
//     eventDescription,
//   };
// };

const PlayersPage = async () => {
  const players = await fetchPlayers();

  // console.log(await fetchLiveGameData());

  return (
    <>
      <Header />
      <div>{players && <PlayersTable players={players} />}</div>
    </>
  );
};

export default PlayersPage;
