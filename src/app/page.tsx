"use client";

import { useMemo } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useForm } from "react-hook-form";
import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

const CHARACTER_LIMIT = 17;

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
    "ME3-2 TAN ZHI QING",
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

type NamePart = {
  value: string;
  type: "givenName" | "surname";
};

type NameInput = {
  name: string;
  type: NameType;
  surnameIndices: Array<number>;
  rank: string;
  isMdes: boolean;
  isDoctor: boolean;
};

const formSchema = z.object({
  name: z.string(),
  type: z.union([
    z.literal("chineseEnglish"),
    z.literal("malay"),
    z.literal("indian"),
  ]),
  surnameIndices: z.array(z.number()),
  rank: z.string(),
  isMdes: z.boolean(),
  isDoctor: z.boolean(),
});

type ParsedName = {
  names: Array<string>;
  type: NameType;
  surnameIndices: Array<number>;
  rank: string | null;
  isMdes: boolean;
  isDoctor: boolean;
};

type Rule = {
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

function renderNameInFull(parsedName: ParsedName) {
  const prefix = getPrefix(parsedName);
  return [prefix, ...parsedName.names].filter(Boolean).join(" ");
}

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
    const mdRegex = /m[aeou][hx][ae]mm?[ae][dt]/gi;
    const adRegex = /abd([aeio]oo|ou)l/gi;

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
    // If meet a surname, immediately remove the rest
    // Otherwise, pick the first and second given names
    const firstGivenNameIndex = value.names.findIndex(
      (_, index) => !value.surnameIndices.includes(index)
    );
    const secondGivenNameIndex = value.names.findIndex(
      (_, index) =>
        !value.surnameIndices.includes(index) && index > firstGivenNameIndex
    );

    // Try to include the first given name and the next name
    const namesTwoGivenNames = value.names.filter(
      (_, index) =>
        value.surnameIndices.includes(index) || index <= secondGivenNameIndex
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

const rules: Record<NameType, Array<Rule>> = {
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

type NameType = "chineseEnglish" | "malay" | "indian";

function getPrefix(parsedName: ParsedName) {
  if (parsedName.isDoctor) {
    return "DR";
  }

  if (parsedName.isMdes) {
    return parsedName.rank;
  }

  return "";
}

function generateName(parsedName: ParsedName) {
  const nameRules = rules[parsedName.type];

  const applyRules = (rules: Array<Rule>) => {
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

    const prefix = getPrefix(name);

    return [prefix, ...name.names].filter(Boolean).join(" ");
  };

  return applyRules(nameRules).toUpperCase();
}

function parseName(input: NameInput): ParsedName {
  return {
    names: input.name.split(" ").filter(Boolean),
    type: input.type,
    surnameIndices: input.surnameIndices,
    rank: input.rank,
    isMdes: input.isMdes,
    isDoctor: input.isDoctor,
  };
}

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "chineseEnglish",
      surnameIndices: [],
      rank: "",
      isMdes: false,
      isDoctor: false,
    },
  });

  const name = form.watch("name");
  const rank = form.watch("rank");
  const isDoctor = form.watch("isDoctor");
  const isMdes = form.watch("isMdes");
  const nameType = form.watch("type");
  const surnameIndices = form.watch("surnameIndices");

  const parsedName = useMemo(() => {
    console.log("parsedName", {
      name,
      type: nameType,
      surnameIndices,
      rank,
      isMdes,
      isDoctor,
    });
    return parseName({
      name,
      type: nameType,
      surnameIndices,
      rank,
      isMdes,
      isDoctor,
    });
  }, [name, nameType, surnameIndices, rank, isMdes, isDoctor]);

  const generatedName = useMemo(() => generateName(parsedName), [parsedName]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-col gap-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          SAF Name Tag Calculator
        </h1>
        <Form {...form}>
          <form className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Full Name"
                      className="uppercase"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your name according to your NRIC.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name Type</FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value as NameType);
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select name type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chineseEnglish">
                          Chinese/English
                        </SelectItem>
                        <SelectItem value="malay">Malay</SelectItem>
                        <SelectItem value="indian">Indian</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="surnameIndices"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Surname/s</FormLabel>
                  <FormDescription>
                    Select the surname/s in your name. Include Bin, Bte, D/O,
                    S/O if applicable.
                  </FormDescription>
                  {parsedName.names.map((name, index) => (
                    <FormField
                      key={index.toString()}
                      control={form.control}
                      name="surnameIndices"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-y-0 space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value.includes(index)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, index]);
                                } else {
                                  field.onChange(
                                    field.value?.filter(
                                      (value) => value !== index
                                    )
                                  );
                                }
                              }}
                            />
                          </FormControl>
                          <div className="grid gap-1.5 leading-none">
                            <FormLabel>{name.toUpperCase()}</FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <FormField
              control={form.control}
              name="isDoctor"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        const isChecked = checked === true;
                        if (isChecked) {
                          form.setValue("isMdes", false);
                        }
                        field.onChange(isChecked);
                      }}
                    />
                  </FormControl>
                  <div className="grid gap-1.5 leading-none">
                    <FormLabel>I am a doctor</FormLabel>
                    <FormDescription>
                      This will add a DR to your name.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="isMdes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          const isChecked = checked === true;
                          if (isChecked) {
                            form.setValue("isDoctor", false);
                          }
                          field.onChange(isChecked);
                        }}
                      />
                    </FormControl>
                    <div className="grid gap-1.5 leading-none">
                      <FormLabel>I am under the MDES scheme</FormLabel>
                      <FormDescription>
                        This will add your MDES rank to your name.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rank"
                render={({ field }) => (
                  <FormItem className="ms-6">
                    <FormLabel>MDES rank</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g. ME1T, ME4-1,
                      ME7"
                        className="uppercase"
                        disabled={!isMdes}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is your full MDES rank. For example, ME1T, ME4-1,
                      ME7.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Separator />
            <div>
              <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                Result ({generatedName.length}/{CHARACTER_LIMIT} characters):
              </h2>
              <div className="flex items-center">
                <div className="flex text-4xl font-bold bg-slate-600 text-white whitespace-pre text-center justify-center aspect-[6] w-[300px]">
                  <div className="border m-1 border-dashed border-white w-full flex items-center justify-center overflow-hidden">
                    <p
                      style={{
                        transform: `scaleX(${Math.min(
                          1,
                          10 / generatedName.length
                        )})`,
                      }}
                    >
                      {generatedName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Separator />
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Rules
            </h2>
            <ul className="list-disc list-inside">
              {rules[nameType].map((rule) => (
                <li key={rule.name}>{rule.name}</li>
              ))}
            </ul>
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
              Examples
            </h2>
            <Table>
              <TableCaption>A list of example name tags</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Doctor?</TableHead>
                  <TableHead>Name Tag</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testCases.map(([input, expected]) => (
                  <TableRow key={expected}>
                    <TableCell>{input.rank}</TableCell>
                    <TableCell>{input.name}</TableCell>
                    <TableCell>{input.isDoctor ? "Yes" : "No"}</TableCell>
                    <TableCell>{generateName(parseName(input))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </form>
        </Form>
      </div>
    </main>
  );
}
