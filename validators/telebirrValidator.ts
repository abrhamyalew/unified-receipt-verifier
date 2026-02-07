import config from "../config/verification.config.js";
import { ValidationError, NotFoundError } from "../utils/errorHandler.js";
import * as cheerio from "cheerio";
import type { Cheerio, CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";
import {
  telebirrParsedData,
  telebirrVerificationFlags,
} from "../types/validationType.js";

type ScopeFn = (selector: string) => Cheerio<AnyNode>;

export const telebirrVerification = (
  rawHTML: string,
  defaultVerification: telebirrVerificationFlags | true,
): boolean => {
  const $: CheerioAPI = cheerio.load(rawHTML);

  const request = $("div").text();

  if (request === "This request is not correct") {
    throw new NotFoundError("Receipt not found or invalid");
  }

  const normalize = (str: string): string =>
    str.replace(/\s+/g, " ").trim().toLowerCase();

  const findAdjacentValue = (labelText: string, scope: ScopeFn = $): string => {
    const matcher = normalize(labelText);
    const td = scope("td")
      .filter((_, el) => normalize($(el).text()).includes(matcher))
      .first();
    if (!td.length) return "";
    return td.next("td").text().replace(/\s+/g, " ").trim();
  };

  const findColumnValueFromHeader = (
    table: Cheerio<AnyNode>,
    labelText: string,
  ): string => {
    const matcher = normalize(labelText);
    const headerTd = table
      .find("td")
      .filter((_, el) => normalize($(el).text()).includes(matcher))
      .first();
    if (!headerTd.length) return "";
    const headerRow = headerTd.closest("tr");
    const colIdx = headerRow.find("td").index(headerTd);
    const valueRow = headerRow.next("tr");
    return valueRow.find("td").eq(colIdx).text().replace(/\s+/g, " ").trim();
  };

  const invoiceTable = $("table")
    .filter(
      (_, el) =>
        $(el)
          .find("td")
          .filter((_, td) => normalize($(td).text()).includes("settled amount"))
          .length > 0,
    )
    .last();

  const statusTable = $("table")
    .filter(
      (_, el) =>
        $(el)
          .find("td")
          .filter((_, td) =>
            normalize($(td).text()).includes("transaction status"),
          ).length > 0,
    )
    .last();

  const accountAndName = $("#paid_reference_number").text();
  const parts = accountAndName.trim().split(/\s+/);
  const accountNumber = parts.shift() ?? "";
  const name = parts.join(" ").trim();

  const amountRaw = invoiceTable.length
    ? findColumnValueFromHeader(invoiceTable, "Settled Amount")
    : "";
  const amountFromTable = amountRaw.replace(/Birr/i, "").trim();

  const date = invoiceTable.length
    ? findColumnValueFromHeader(invoiceTable, "Payment date")
    : "";

  const status = statusTable.length
    ? findAdjacentValue("transaction status", (sel) => statusTable.find(sel))
    : "";

  const parsedData: telebirrParsedData = {
    amount: amountFromTable,
    status: status,
    recipientName: name,
    date: date,
    accountNumber: accountNumber,
  };

  let verificationFlags: Partial<telebirrVerificationFlags>;

  if (defaultVerification === true) {
    verificationFlags = config.telebirr.defaultVerificationFields;
  } else if (
    typeof defaultVerification === "object" &&
    defaultVerification !== null
  ) {
    verificationFlags = defaultVerification;
  } else {
    verificationFlags = config.telebirr.defaultVerificationFields;
  }

  const expectedData = config.telebirr.expectedData;

  const compareAmount = (expected: string | number, parsed: string | number) => {
    const expectedNum = Number(expected);
    const parsedNum = Number(parsed);
    if (Number.isNaN(expectedNum) || Number.isNaN(parsedNum)) {
      return String(expected).trim() === String(parsed).trim();
    }
    return expectedNum === parsedNum;
  };

  type verificationKey = keyof telebirrVerificationFlags;
  const verificationKeys: verificationKey[] = [
    "amount",
    "status",
    "recipientName",
    "accountNumber",
    "date",
  ];

  for (const key of verificationKeys) {
    if (!verificationFlags[key]) continue;

    if (key === "date") {
      const parsed = parsedData[key];
      if (!parsed) {
        throw new ValidationError("No parsed data for date");
      }

      const [datePart] = parsed.split(" ");
      const [day, month, year] = datePart.split("-");

      if (
        expectedData.paymentYear &&
        year !== String(expectedData.paymentYear)
      ) {
        throw new ValidationError(
          `Year mismatch. Expected: ${expectedData.paymentYear}, Actual: ${year}`,
        );
      }
      if (
        expectedData.paymentMonth &&
        month !== String(expectedData.paymentMonth)
      ) {
        throw new ValidationError(
          `Month mismatch. Expected: ${expectedData.paymentMonth}, Actual: ${month}`,
        );
      }
      continue;
    }

    const expected = expectedData[key];
    const parsed = parsedData[key];

    if (expected === undefined || expected === null) {
      throw new ValidationError(
        `No expected data for "${key}", failing verification.`,
      );
    }

    if (parsed === undefined || parsed === null || parsed === "") {
      throw new ValidationError(
        `No parsed data for "${key}", failing verification.`,
      );
    }

    const matches =
      key === "amount"
        ? compareAmount(expected, parsed)
        : String(expected).trim() === String(parsed).trim();

    if (!matches) {
      throw new ValidationError(
        `Mismatch on ${key}. Expected: ${expected}, Actual: ${parsed}`,
      );
    }
  }

  return true;
};
