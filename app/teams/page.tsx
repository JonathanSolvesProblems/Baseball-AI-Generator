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
        <h1>Teams</h1>
        <TeamsTable teams={teams} />
      </div>
    </>
  );
};

export default TeamsPage;
