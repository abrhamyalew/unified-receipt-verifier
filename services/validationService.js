import config from "../config/verification.config.js";
import * as cheerio from "cheerio";

const validatVerification = (rawHTML, defaultVerification, verify) => {
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

  // In the invoice table, headers are on one row and the values are on the next row.
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

  const verificationFlags = config.defaultVerificationFields;

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

    // Special handling for date - compare year and month only
    if (key === "date") {
      const parsed = parsedData[key];
      if (!parsed) {
        console.log(`No parsed data for "date", failing verification.`);
        return false;
      }
      // Date format is "DD-MM-YYYY HH:MM:SS"
      const [datePart] = parsed.split(" ");
      const [day, month, year] = datePart.split("-");

      if (
        expectedData.paymentYear &&
        year !== String(expectedData.paymentYear)
      ) {
        console.log(
          `Year mismatch. Expected: ${expectedData.paymentYear}, Actual: ${year}`
        );
        return false;
      }
      if (
        expectedData.paymentMonth &&
        month !== String(expectedData.paymentMonth)
      ) {
        console.log(
          `Month mismatch. Expected: ${expectedData.paymentMonth}, Actual: ${month}`
        );
        return false;
      }
      continue; // Date validated, move to next field
    }

    const expected = expectedData[key];
    const parsed = parsedData[key];

    if (expected === undefined || expected === null) {
      console.log(`No expected data for "${key}", failing verification.`);
      return false;
    }

    if (parsed === undefined || parsed === null || parsed === "") {
      console.log(`No parsed data for "${key}", failing verification.`);
      return false;
    }

    const matches =
      key === "amount"
        ? compareAmount(expected, parsed)
        : String(expected).trim() === String(parsed).trim();

    if (!matches) {
      console.log(
        `Mismatch on ${key}. Expected: ${expected}, Actual: ${parsed}`
      );
      return false;
    }
  }

  return true;
};

export default validatVerification;
