import getParsedNamePrefix from "./getParsedNamePrefix";
import { ParsedName } from "./types";

export default function renderNameInFull(parsedName: ParsedName) {
  const prefix = getParsedNamePrefix(parsedName);
  return [prefix, ...parsedName.names].filter(Boolean).join(" ");
}
