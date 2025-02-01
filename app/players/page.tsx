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
