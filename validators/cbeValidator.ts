import config from "../config/verification.config.js";
import { ValidationError } from "../utils/errorHandler.js";
import { createRequire } from "module";
import { cbePdfData, cbeMbParsedData, cbeVerificationFlags } from "../types/validationType.js";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse/lib/pdf-parse.js");

export const cbeVerification = async (pdfResponse: cbePdfData | cbeMbParsedData, defaultVerification: cbeVerificationFlags | true) => {

  let parsedData: { amount: string | undefined, date: string | undefined, accountNumber: string | undefined, recipientName: string | undefined };

  if ('arrayBuffer' in pdfResponse) {
    const buffer = await pdfResponse.arrayBuffer();
    const data = await pdf(Buffer.from(buffer));
    const text = data.text;

    function extractField(text: string, regex: RegExp | string) {
      const match = text.match(regex);
      return match ? match[1].trim() : null;
    }

    parsedData = {
      amount: extractField(text, /Transferred Amount\s*([\d.]+\s*ETB)/i)?.split(".",)[0] ?? "",

      date: extractField(
        text,
        /Payment Date\s*&\s*Time\s*(\d{2}\/\d{2}\/\d{4})/i,
      ) ?? undefined,

      accountNumber: extractField(
        text,
        /Receiver[\s\S]*?Account\s*(1\*{4}\d{4})/i,
      ) ?? undefined,

      recipientName: extractField(text, /Receiver\s*([A-Z\s]+?)(?=\s*Account)/i) ?? undefined,
    };
  } else {
    const dateStr = pdfResponse.dateTimes?.[0];
    let formattedDate: string | undefined = undefined;
    if (dateStr) {
      const datePart = dateStr.split("T")[0];
      if (datePart) {
        const [year, month, day] = datePart.split("-");
        if (month && day && year) {
          formattedDate = `${month}/${day}/${year}`;
        }
      }
    }
    parsedData = {
      amount: pdfResponse.debitAmount ? pdfResponse.debitAmount.split('.')[0] : "",
      date: formattedDate,
      accountNumber: pdfResponse.creditAccountNo,
      recipientName: pdfResponse.creditAccountHolder,
    };
  }

  let verificationFlags: Partial<cbeVerificationFlags>;

  if (defaultVerification === true) {
    verificationFlags = config.cbe.defaultVerificationFields;
  } else if (
    typeof defaultVerification === "object" &&
    defaultVerification !== null
  ) {
    verificationFlags = defaultVerification;
  } else {
    verificationFlags = config.cbe.defaultVerificationFields;
  }

  const expectedData = config.cbe.expectedData;



  const compareAmount = (expected: string | number, parsed: string | number ) => {
    const expectedNum = Number(expected);
    const parsedNum = Number(parsed);
    if (Number.isNaN(expectedNum) || Number.isNaN(parsedNum)) {
      return String(expected).trim() === String(parsed).trim();
    }
    return expectedNum === parsedNum;
  };

  
  type verificationKey = keyof cbeVerificationFlags
  const verificationKeys: verificationKey[] = [
    "date",
    "amount",
    "recipientName",
    "accountNumber",
  ];

  for (const key of verificationKeys) {
    if (!verificationFlags[key]) continue;

    if (key === "date") {
      const parsed = parsedData[key];
      if (!parsed) {
        throw new ValidationError("No parsed data for date");
      }

      const dateParts = parsedData.date;
      if (dateParts) {
        const [month, day, year] = dateParts.split("/");

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
        : String(expected).trim().toLowerCase() === String(parsed).trim().toLowerCase();

    if (!matches) {
      throw new ValidationError(
        `Mismatch on ${key}. Expected: ${expected}, Actual: ${parsed}`,
      );
    }
  }

  return true;
};
