// Pretend domain objects for editing in the form, i.e. as generated
// by a GraphQL schema for a `saveAuthor` mutation that takes an author
// plus the author's books.

import { type DateRange, type PlainDate } from "src/types";
import { Temporal } from "temporal-polyfill";

export const jan1 = Temporal.PlainDate.from("2020-01-01");
export const jan2 = Temporal.PlainDate.from("2020-01-02");
export const jan10 = Temporal.PlainDate.from("2020-01-10");
export const jan19 = Temporal.PlainDate.from("2020-01-19");
export const jan29 = Temporal.PlainDate.from("2020-01-29");
export const dd100: DeweyDecimalClassification = { number: "100", category: "Philosophy" };
export const dd200: DeweyDecimalClassification = { number: "200", category: "Religion" };

export enum AuthorHeight {
  SHORT,
  TALL,
}

export interface AuthorInput {
  id?: string | null;
  height?: AuthorHeight | null;
  firstName?: string | null;
  middleInitial?: string | null;
  lastName?: string | null;
  birthday?: PlainDate | null;
  heightInInches?: number | null;
  royaltiesInCents?: number | null;
  royaltiesInMills?: number | null;
  books?: BookInput[] | null;
  address?: AuthorAddress | null;
  favoriteSport?: string | null;
  favoriteColors?: string[] | null;
  favoriteShapes?: string[] | null;
  isAvailable?: boolean | null;
  animals?: string[] | null;
  bio?: string | null;
  saleDates?: DateRange | null;
  favoriteGenres?: string[] | null;
}

export interface AuthorAddress {
  street?: string | null;
  city?: string | null;
}

export interface BookInput {
  id?: string | null | undefined;
  title?: string | null | undefined;
  summary?: string | null | undefined;
  classification?: DeweyDecimalClassification;
  delete?: boolean | null | undefined;
  isPublished?: boolean;
}

export interface DeweyDecimalClassification {
  number: string;
  category: string;
}
