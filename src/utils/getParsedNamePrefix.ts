import { ParsedName } from "./types";

export default function getParsedNamePrefix(parsedName: ParsedName) {
  if (parsedName.isDoctor) {
    return "DR";
  }

  if (parsedName.isMdes) {
    return parsedName.rank;
  }

  return "";
}
