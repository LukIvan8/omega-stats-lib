import { UnfilteredSearchResult } from "./dto";
import { AdjacentRankedPlayers, PlayerRankedData, PlayerSearchResponse } from "./dto";

export function searchPlayer(playerName:string, data:UnfilteredSearchResult):string {
  return data.matches
    .filter(matchs => matchs.username.toLowerCase() === playerName.toLowerCase())
    .map(match => match.playerId)[0]
};

export function searchInfo(playerName:string, data:AdjacentRankedPlayers):PlayerRankedData {
  return data.players
    .filter(
      (players) => players.username.toLowerCase() === playerName.toLowerCase()
    )
    .map((player) => player)[0];
}
