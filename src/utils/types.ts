export type NameType = "chineseEnglish" | "malay" | "indian";

export type NameInput = {
  name: string;
  type: NameType;
  surnameIndices: Array<number>;
  rank: string;
  isMdes: boolean;
  isDoctor: boolean;
};

export type ParsedName = {
  names: Array<string>;
  type: NameType;
  surnameIndices: Array<number>;
  rank: string | null;
  isMdes: boolean;
  isDoctor: boolean;
};
