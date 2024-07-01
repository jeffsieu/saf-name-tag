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
import generateCandidateNames from "@/utils/generateCandidateNames";
import { CHARACTER_LIMIT } from "@/utils/constants";
import { rulesByNameType } from "@/utils/rules";
import { exampleNames } from "@/utils/examples";
import parseName from "@/utils/parseName";
import { NameType } from "@/utils/types";

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
  const selectedRules = useMemo(() => rulesByNameType[nameType], [nameType]);

  const parsedName = useMemo(() => {
    return parseName({
      name,
      type: nameType,
      surnameIndices,
      rank,
      isMdes,
      isDoctor,
    });
  }, [name, nameType, surnameIndices, rank, isMdes, isDoctor]);

  const generatedCandidateNames = useMemo(
    () => generateCandidateNames(parsedName),
    [parsedName]
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="flex flex-col gap-8 max-w-3xl pt-8">
        <div className="space-y-4">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            SAF Name Tag Calculator
          </h1>
          <p className="text-muted-foreground">
            Find out how to write your name on an SAF No. 4 name tag based on
            the latest name tag conventions.
          </p>
        </div>
        <Form {...form}>
          <form className="grid space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <Input
                      className="uppercase"
                      autoComplete="off"
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
              render={() => (
                <FormItem>
                  <div className="grid space-y-1.5 mb-4">
                    <FormLabel>Surname/s</FormLabel>
                    <FormDescription>
                      Select the surname/s in your name. Include Bin, Bte, D/O,
                      S/O if applicable.
                    </FormDescription>
                  </div>
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
                        autoComplete="off"
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
          </form>
        </Form>
        <section className="grid space-y-2">
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Results
          </h2>
          <div className="grid gap-y-4">
            {generatedCandidateNames.map((generatedName, index) => (
              <div
                key={generatedName}
                className="flex flex-col items-center gap-0.5"
              >
                {index === 1 && (
                  <div className="flex self-stretch items-center gap-2 mb-4">
                    <Separator className="flex-1" />
                    <p className="text-muted-foreground text-md">
                      You may also try
                    </p>
                    <Separator className="flex-1" />
                  </div>
                )}
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
                <p className="text-muted-foreground text-sm font-mono">
                  {generatedName.length}/{CHARACTER_LIMIT} chars
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="grid space-y-2">
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Rules
          </h2>
          <ul className="list-disc list-inside">
            {selectedRules.map((rule) => (
              <li key={rule.name}>{rule.name}</li>
            ))}
          </ul>
        </section>
        <section className="grid space-y-2">
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
              {exampleNames.map(({ input, candidates }) => (
                <TableRow key={input.name}>
                  <TableCell>{input.rank}</TableCell>
                  <TableCell>{input.name}</TableCell>
                  <TableCell>{input.isDoctor ? "Yes" : "No"}</TableCell>
                  <TableCell>{candidates.join(", ")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
        <p className="text-muted-foreground text-sm">
          Disclaimer: This application is for educational purposes only. It is a
          personal project and is not an official tool associated with/developed
          by the SAF.
        </p>
      </div>
    </main>
  );
}
