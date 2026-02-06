import config from "../config/verification.config.js";
import { ValidationError } from "../utils/errorHandler.js";
import { boaParsedData, boaVerificationFlags } from "../types/validationType.js"

export const boaVerification = async (parsedData: boaParsedData, defaultVerification: boaVerificationFlags | true) => {
  const date = parsedData["Transaction Date"];

  if (!date) {
    throw new ValidationError("No parsed data for Transaction Date");
  }

  const [datePart] = date.split(" ");
  const [day, month, year] = datePart.split("/");

  const receiptData = {
    amount: parsedData["Transferred Amount"],
    month: month,
    year: year,
    recipientName: parsedData["Receiver's Name"],
    accountNumber: parsedData["Receiver's Account"],
  };

  let verificationFlags: Partial<boaVerificationFlags>;

  if (defaultVerification === true) {
    verificationFlags = config.boa.defaultVerificationFields;
  } else if (
    typeof defaultVerification === "object" &&
    defaultVerification !== null
  ) {
    verificationFlags = defaultVerification;
  } else {
    verificationFlags = config.boa.defaultVerificationFields;
  }

  const expectedData = config.boa.expectedData;

  const compareAmount = (expected: number | string, parsed: number | string): boolean => {
    const expectedNum = Number(expected);
    const parsedNum = Number(parsed);
    if (Number.isNaN(expectedNum) || Number.isNaN(parsedNum)) {
      return String(expected).trim() === String(parsed).trim();
    }
    return expectedNum === parsedNum;
  };

  type verificationKey = keyof boaVerificationFlags
  type DataKey = Exclude<verificationKey, "date">;

  const verificationKeys: verificationKey[] = [
    "date",
    "amount",
    "recipientName",
    "accountNumber",
  ];


  for (const key of verificationKeys) {
    if (!verificationFlags[key]) continue;

    if (key === "date") {
      if (
        expectedData.paymentYear &&
        receiptData.year !== String(expectedData.paymentYear)
      ) {
        throw new ValidationError(
          `Year mismatch. Expected: ${expectedData.paymentYear}, Actual: ${receiptData.year}`,
        );
      }
      if (
        expectedData.paymentMonth &&
        receiptData.month !== String(expectedData.paymentMonth)
      ) {
        throw new ValidationError(
          `Month mismatch. Expected: ${expectedData.paymentMonth}, Actual: ${receiptData.month}`,
        );
      }
      continue;
    }

    const dataKey = key as DataKey;

    const expected = expectedData[dataKey];
    const parsed = receiptData[dataKey];

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
