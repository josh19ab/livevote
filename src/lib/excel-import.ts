"use client";

import * as XLSX from "xlsx";

/** Parse first column (or Name/Option header) from an Excel/CSV file into option strings. */
export async function parseOptionsFromSpreadsheet(file: File): Promise<string[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
  });

  if (!rows.length) return [];

  const firstRow = rows[0].map((c) => String(c).trim().toLowerCase());
  const nameCol = firstRow.findIndex((h) =>
    ["name", "option", "nominee", "candidate", "person", "title"].includes(h),
  );
  const col = nameCol >= 0 ? nameCol : 0;
  const start = nameCol >= 0 ? 1 : 0;

  const options: string[] = [];
  const seen = new Set<string>();

  for (let i = start; i < rows.length; i++) {
    const raw = rows[i]?.[col];
    const value = String(raw ?? "").trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    options.push(value);
  }

  return options;
}
