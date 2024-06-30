import { CHARACTER_LIMIT } from "./constants";
import renderNameInFull from "./renderNameInFull";
import { NameType, ParsedName } from "./types";

export type Rule = {
  name: string;
  validate: (value: ParsedName) => boolean;
  transform?: (value: ParsedName) => ParsedName | string;
};

const surnamePrintedInFull: Rule = {
  name: "Surname is to be printed in full",
  validate: (value) => true,
};

const mdesRankAndGrade: Rule = {
  name: "Rank and grade to be reflected for servicepersons in Military Domain Expert Scheme (MDES).",
  validate: (value) => true,
};

const doctorTitle: Rule = {
  name: "Doctor title (DR) to be reflected for Medical Officers.",
  validate: (value) => true,
};

const alphabetOnly: Rule = {
  name: "Should only include letters from A to Z",
  validate: (value) => true,
};

const spellInFullIfPossible: Rule = {
  name: "Name spelt in full in accordance to NRIC if it is within 17 characters including MDES ranks or Doctor title, if applicable.",
  validate: (value) => true, // TODO
  transform: (value) => {
    const speltInFull = renderNameInFull(value);

    if (speltInFull.length <= CHARACTER_LIMIT) {
      return speltInFull;
    }

    return value;
  },
};

const excludeFathersName: Rule = {
  name: "Exclude father's name",
  validate: (value) => true, // TODO
  transform: (value) => {
    // Remove surname if present
    const names =
      value.surnameIndices !== null
        ? value.names.filter(
            (_, index) => !value.surnameIndices.includes(index)
          )
        : value.names;
    return { ...value, names, surnameIndices: [] };
  },
};

const onlyFirstGivenName: Rule = {
  name: "Only first given name will be spelt in full.",
  validate: (value) => true, // TODO
  transform: (value) => {
    const firstGivenNameIndex = value.names.findIndex(
      (_, index) =>
        !value.surnameIndices.includes(index) &&
        !["MD", "AD"].includes(value.names[index].toUpperCase())
    );
    const names = value.names.filter(
      (_, index) =>
        value.surnameIndices.includes(index) ||
        index === firstGivenNameIndex ||
        ["MD", "AD"].includes(value.names[index].toUpperCase())
    );
    return { ...value, names, surnameIndices: [] };
  },
};

const abbreviateMdAndAd: Rule = {
  name: "MD and AD can used as abbreviation for Mohammed/Mohamad and Abdul respectively.",
  validate: (value) => true, // TODO
  transform: (value) => {
    const mdRegex = /^m[aeou][hx][ae]mm?[ae][dt]$/gi;
    const adRegex = /^abd([aeio]oo|ou)l$/gi;

    const names = value.names.map((name) =>
      name.replace(mdRegex, "MD").replace(adRegex, "AD")
    );

    return { ...value, names };
  },
};

const abbreviateGivenNames: Rule = {
  name: "Given names to be abbreviated to initials before or after surname based on NRIC sequence.",
  validate: (value) => true, // TODO
  transform: (value) => {
    const names = value.names.map((name, index) => {
      const isSurname = value.surnameIndices.includes(index);
      return isSurname ? name : name.substring(0, 1);
    });
    return { ...value, names };
  },
};

const truncateAbbreviatedNames: Rule = {
  name: "If abbreviated given names exceeds 17 characters, only first and/or second given names will be abbreviated to initials.",
  validate: (value) => true, // TODO
  transform: (value) => {
    const renderedName = renderNameInFull(value);

    if (renderedName.length <= CHARACTER_LIMIT) {
      return value;
    }

    // If meet a surname, immediately remove the rest
    // Otherwise, pick the first and second given names
    const firstGivenNameIndex = value.names.findIndex(
      (_, index) => !value.surnameIndices.includes(index)
    );

    // Try to include the first given name and the next name
    const namesTwoGivenNames = value.names.filter(
      (_, index) =>
        value.surnameIndices.includes(index) || index <= firstGivenNameIndex + 1
    );
    const nameWithTwoGivenNames = { ...value, names: namesTwoGivenNames };
    const renderedNameWithTwoGivenNames = renderNameInFull(
      nameWithTwoGivenNames
    );
    if (renderedNameWithTwoGivenNames.length <= CHARACTER_LIMIT) {
      return nameWithTwoGivenNames;
    }

    const namesOneGivenName = value.names.filter(
      (_, index) =>
        value.surnameIndices.includes(index) || index <= firstGivenNameIndex
    );
    return { ...value, names: namesOneGivenName };
  },
};

export const rulesByNameType: Record<NameType, Array<Rule>> = {
  chineseEnglish: [
    spellInFullIfPossible,
    abbreviateGivenNames,
    truncateAbbreviatedNames,
    alphabetOnly,
    surnamePrintedInFull,
  ],
  malay: [
    excludeFathersName,
    abbreviateMdAndAd,
    onlyFirstGivenName,
    alphabetOnly,
  ],
  indian: [excludeFathersName, onlyFirstGivenName, alphabetOnly],
};
