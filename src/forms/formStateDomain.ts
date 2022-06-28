// Pretend domain objects for editing in the form, i.e. as generated
// by a GraphQL schema for a `saveAuthor` mutation that takes an author
// plus the author's books.

import { DateRange } from "src/types";

export const jan1 = new Date(2020, 0, 1);
export const jan2 = new Date(2020, 0, 2);
export const jan10 = new Date(2020, 0, 10);
export const jan19 = new Date(2020, 0, 19);
export const jan29 = new Date(2020, 0, 29);
export const dd100: DeweyDecimalClassification = { number: "100", category: "Philosophy" };
export const dd200: DeweyDecimalClassification = { number: "200", category: "Religion" };

export interface AuthorInput {
  id?: string | null;
  firstName?: string | null;
  middleInitial?: string | null;
  lastName?: string | null;
  birthday?: Date | null;
  heightInInches?: number | null;
  royaltiesInCents?: number | null;
  books?: BookInput[] | null;
  address?: AuthorAddress | null;
  favoriteSport?: string | null;
  favoriteColors?: string[] | null;
  favoriteShapes?: string[] | null;
  isAvailable?: boolean | null;
  animals?: string[] | null;
  bio?: string | null;
  saleDates?: DateRange | null;
}

export interface AuthorAddress {
  street?: string | null;
  city?: string | null;
}

export interface BookInput {
  id?: string | null | undefined;
  title?: string | null | undefined;
  classification?: DeweyDecimalClassification;
  delete?: boolean | null | undefined;
  isPublished?: boolean;
}

export interface DeweyDecimalClassification {
  number: string;
  category: string;
}

export class DateOnly {
  constructor(private readonly date: Date) {}

  toString() {
    return this.date.toISOString().split("T")[0];
  }

  toJSON() {
    return this.toString();
  }
}
