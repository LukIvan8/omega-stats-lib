import {regions} from "./regions";

export function selectServer(region) {
  return region === "global" ? "" : `&specificRegion=${regions[region.toLowerCase()]}`;
}