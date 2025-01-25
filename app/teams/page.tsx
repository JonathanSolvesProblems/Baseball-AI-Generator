import React from "react";
import TeamsTable from "./TeamsTable";
import Header from "../components/Header";
import { getMLBTeams } from "../utils/apiPaths";

const TeamsPage = async () => {
  const fetchTeams = async () => {
    const teamDetails: any = await getMLBTeams();
    return teamDetails;
  };

  const teams = await fetchTeams();

  return (
    <>
      <Header />
      <div>
        <TeamsTable teams={teams} />
      </div>
    </>
  );
};

export default TeamsPage;
