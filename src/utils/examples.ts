import generateCandidateNames from "./generateCandidateNames";
import parseName from "./parseName";
import { NameInput } from "./types";

const testCases: Array<[NameInput, string]> = [
  [
    {
      name: "TAN BEE LIAN",
      type: "chineseEnglish",
      surnameIndices: [0],
      rank: "CPT",
      isMdes: false,
      isDoctor: false,
    },
    "TAN BEE LIAN",
  ],
  [
    {
      name: "TAN ZHI QING",
      type: "chineseEnglish",
      surnameIndices: [0],
      rank: "ME3-2",
      isMdes: true,
      isDoctor: false,
    },
    "ME3-2 TAN Z Q",
  ],
  [
    {
      name: "TAN JUN WEI",
      type: "chineseEnglish",
      surnameIndices: [0],
      rank: "CPT",
      isMdes: false,
      isDoctor: true,
    },
    "DR TAN JUN WEI",
  ],
  [
    {
      name: "ALEXANDER MAXIMUS CHONG CHEE KEONG",
      type: "chineseEnglish",
      surnameIndices: [2],
      rank: "ME2-2",
      isMdes: true,
      isDoctor: false,
    },
    "ME2-2 A M CHONG",
  ],
  [
    {
      name: "MOHAMED AHMAD BIN BAHARUDIN",
      type: "malay",
      surnameIndices: [2, 3],
      rank: "CPL",
      isMdes: false,
      isDoctor: false,
    },
    "MD AHMAD",
  ],
  [
    {
      name: "ADYA D/O NARAIN",
      type: "indian",
      surnameIndices: [1, 2],
      rank: "ME4-3",
      isMdes: true,
      isDoctor: false,
    },
    "ME4-3 ADYA",
  ],
];

export const exampleNames = testCases.map(([input]) => ({
  input,
  candidates: generateCandidateNames(parseName(input)),
}));
