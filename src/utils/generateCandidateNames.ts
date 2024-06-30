import renderNameInFull from "./renderNameInFull";
import { Rule, rulesByNameType } from "./rules";
import { ParsedName } from "./types";

export default function generateCandidateNames(parsedName: ParsedName) {
  const nameRules = rulesByNameType[parsedName.type];

  const applyRules = (rules: Array<Rule>, parsedName: ParsedName) => {
    const nameRules = [...rules];
    let name = parsedName;

    while (nameRules.length > 0) {
      const rule = nameRules.shift()!;
      const result = rule.transform?.(name) ?? name;

      if (typeof result === "string") {
        return result;
      }

      name = result;
    }

    return renderNameInFull(name);
  };

  const parsedNameCandidates = (() => {
    if (parsedName.type === "chineseEnglish") {
      if (parsedName.surnameIndices.length === 0) {
        return [parsedName];
      }
      // For Alex Tan Jun Xiong, try also:
      // - Alex Tan
      // - Tan Jun Xiong
      const firstSurnameIndex = parsedName.surnameIndices.reduce(
        (acc, index) => Math.min(acc, index),
        parsedName.names.length
      );
      const lastSurnameIndex = parsedName.surnameIndices.reduce(
        (acc, index) => Math.max(acc, index),
        -1
      );

      const hasNamesOnBothSides =
        firstSurnameIndex > 0 && lastSurnameIndex < parsedName.names.length - 1;

      if (hasNamesOnBothSides) {
        const frontNamesOnly: ParsedName = {
          ...parsedName,
          names: parsedName.names.slice(0, lastSurnameIndex + 1),
        };
        const backNamesOnly: ParsedName = {
          ...parsedName,
          names: parsedName.names.slice(firstSurnameIndex),
          surnameIndices: parsedName.surnameIndices.map(
            (index) => index - firstSurnameIndex
          ),
        };

        return [parsedName, frontNamesOnly, backNamesOnly];
      }

      return [parsedName];
    }

    return [parsedName];
  })();

  const results = parsedNameCandidates.map((parsedName) =>
    applyRules(nameRules, parsedName).toUpperCase()
  );

  return Array.from(new Set(results));
}
