import { Temporal } from "temporal-polyfill";

export const janDates = Array.from({ length: 31 }, (_, i) => new Temporal.PlainDate(2020, 1, i + 1));

export const [
  jan1,
  jan2,
  jan3,
  jan4,
  jan5,
  jan6,
  jan7,
  jan8,
  jan9,
  jan10,
  jan11,
  jan12,
  jan13,
  jan14,
  jan15,
  jan16,
  jan17,
  jan18,
  jan19,
  jan20,
  jan21,
  jan22,
  jan23,
  jan24,
  jan25,
  jan26,
  jan27,
  jan28,
  jan29,
  jan30,
  jan31,
] = janDates;

export const febDates = Array.from({ length: 29 }, (_, i) => new Temporal.PlainDate(2020, 2, i + 1));

export const [feb1, feb2, feb3, feb4, feb5, feb6, feb7, feb8, feb9, feb10, feb11] = febDates;
