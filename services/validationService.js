import config from "../config/verification.config.js";
import { ValidationError } from "../utils/errorHandler.js";
import * as cheerio from "cheerio";

const validatVerification = (rawHTML, defaultVerification) => {
  const $ = cheerio.load(rawHTML);

  const request = $("div").text();

  if (request === "This request is not correct") {
    return;
  }

  const normalize = (str) => str.replace(/\s+/g, " ").trim().toLowerCase();

  const findAdjacentValue = (labelText, scope = $) => {
    const matcher = normalize(labelText);
    const td = scope("td")
      .filter((_, el) => normalize($(el).text()).includes(matcher))
      .first();
    if (!td.length) return "";
    return td.next("td").text().replace(/\s+/g, " ").trim();
  };

  const findColumnValueFromHeader = (table, labelText) => {
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
          .length > 0
    )
    .last();

  const statusTable = $("table")
    .filter(
      (_, el) =>
        $(el)
          .find("td")
          .filter((_, td) =>
            normalize($(td).text()).includes("transaction status")
          ).length > 0
    )
    .last();

  const accountAndName = $("#paid_reference_number").text();
  const parts = accountAndName.trim().split(/\s+/);
  const accountNumber = parts.shift();
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

  const parsedData = {
    amount: amountFromTable,
    status: status,
    recipientName: name,
    date: date,
    accountNumber: accountNumber,
  };

  console.log(parsedData);

  let verificationFlags;

  if (defaultVerification === true) {
    verificationFlags = config.defaultVerificationFields;
  } else if (
    typeof defaultVerification === "object" &&
    defaultVerification !== null
  ) {
    verificationFlags = defaultVerification;
  } else {
    verificationFlags = config.defaultVerificationFields;
  }

  const expectedData = config.expectedData;

  const compareAmount = (expected, parsed) => {
    const expectedNum = Number(expected);
    const parsedNum = Number(parsed);
    if (Number.isNaN(expectedNum) || Number.isNaN(parsedNum)) {
      return String(expected).trim() === String(parsed).trim();
    }
    return expectedNum === parsedNum;
  };

  for (const key in verificationFlags) {
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
          `Year mismatch. Expected: ${expectedData.paymentYear}, Actual: ${year}`
        );
      }
      if (
        expectedData.paymentMonth &&
        month !== String(expectedData.paymentMonth)
      ) {
        throw new ValidationError(
          `Month mismatch. Expected: ${expectedData.paymentMonth}, Actual: ${month}`
        );
      }
      continue;
    }

    const expected = expectedData[key];
    const parsed = parsedData[key];

    if (expected === undefined || expected === null) {
      throw new ValidationError(
        `No expected data for "${key}", failing verification.`
      );
    }

    if (parsed === undefined || parsed === null || parsed === "") {
      throw new ValidationError(
        `No parsed data for "${key}", failing verification.`
      );
    }

    const matches =
      key === "amount"
        ? compareAmount(expected, parsed)
        : String(expected).trim() === String(parsed).trim();

    if (!matches) {
      throw new ValidationError(
        `Mismatch on ${key}. Expected: ${expected}, Actual: ${parsed}`
      );
    }
  }

  return true;
};

export default validatVerification;
