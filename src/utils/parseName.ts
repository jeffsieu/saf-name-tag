import { NameInput, ParsedName } from "./types";

export default function parseName(input: NameInput): ParsedName {
  return {
    names: input.name.split(" ").filter(Boolean),
    type: input.type,
    surnameIndices: input.surnameIndices,
    rank: input.rank,
    isMdes: input.isMdes,
    isDoctor: input.isDoctor,
  };
}
