import axios, { AxiosInstance } from "axios";

import { OSError } from "./utils/Error";

import { selectServer } from "./utils/selectServer";

import { regions } from "./utils/regions";
import { Leaderboard, LevelData, StrikerMastery } from "./utils/dto";
import {searchPlayer, searchInfo} from "./utils/searchPlayer"
import { PlayerRankedData } from "./utils/dto";

export default class OmegaStrikers {
  token: string;
  refresh: string;
  instance:AxiosInstance;

  constructor({ token, refresh }: { token: string; refresh: string }) {
    this.token = token;
    this.refresh = refresh;

    if (!this.token || !this.refresh) {
      throw new OSError("Token or Token Refresh invalid.");
    }
    //@ts-ignore
    this.instance = axios.create({
      baseURL: "https://prometheus-proxy.odysseyinteractive.gg/api",
      headers: {
        "X-Authorization": `Bearer ${this.token}`,
        "X-Refresh-Token": this.refresh,
      },
    });
  }

  // < Leaderboard > \\
  async leaderboard(players: number, region: string):Promise<Leaderboard>{
    if (!players && !region)
      throw new OSError("Invalid players number and region.");
    if (!regions.hasOwnProperty(region.toLowerCase()))
      throw new OSError("Invalid server.");
    if (players < 1 || players > 10000)
      throw new OSError("Minimum players is 1 and Max players is 10000.");

    let {data} = await this.instance
      .get<Leaderboard>(
        `/v1/ranked/leaderboard/players?startRank=0&pageSize=${players}${selectServer(
          region
        )}`
      )
    return data;
  }

  // < Search Player By ID >
  async search(playerName: string):Promise<string> {
    try {
      const {data} = await this.instance.get(
        `/v1/players?usernameQuery=${playerName}`
      );
      if (data.matches.length == 0)
        throw new OSError("Player not found.");
      return searchPlayer(playerName, data);
    } catch (e) {
      if (e.response.data.error.message === "Player not authorized.")
        throw new OSError("Token or Token Refresh not authorized.");
      throw new OSError("Unknown error.");
    }
  }

  // < Show Profile (Ranked) >
  async ranked(playerName: string, region: string):Promise<PlayerRankedData> {
    const playerId = await this.search(playerName);
    if (!regions.hasOwnProperty(region.toLowerCase())) throw new OSError("Invalid region defined");

    try {
      const { data } = await this.instance.get(
        `/v1/ranked/leaderboard/search/${playerId}?entriesBefore=1&entriesAfter=1&specificRegion=${selectServer(
          region
        )}`
      );
      return searchInfo(playerName, data);
    } catch (e) {
      throw new OSError(
        "This player either doesn't have any ranked games or is not among the top 10,000 players."
      );
    }
  }

  // < Show Account Level >
  async level(playerName: string):Promise<LevelData>{
    const playerId = await this.search(playerName);

    const { data } = await this.instance.get(`/v1/mastery/${playerId}/player`);
    return data;
  }

  // < Show Profile Mastery Characters >
  async mastery(playerName: string):Promise<StrikerMastery> {
    const playerId = await this.search(playerName);

    const { data } = await this.instance.get(
      `/v2/mastery/${playerId}/characters`
    );
    return data;
  }
}
