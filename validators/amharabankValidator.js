import config from "../config/verification.config.js";
import { ValidationError } from "../utils/errorHandler.js";

export const amharaBankVerification = (parsedData, defaultVerification) => {
  if (parsedData["status"] !== "Auth") {
    throw new ValidationError("Transaction status is not successful");
  }

  const date = parsedData["bookingDate"];

  if (!date) {
    throw new ValidationError("No parsed data for Transaction Date");
  }

  const year = date.slice(0, 4);
  const month = date.slice(4, 6);

  const receiptData = {
    amount: parsedData["amount"],
    month: month,
    year: year,
    recipientName: parsedData["creditorName"],
    accountNumber: parsedData["creditAccountId"],
  };

  let verificationFlags;

  if (defaultVerification === true) {
    verificationFlags = config.amharaBank.defaultVerificationFields;
  } else if (
    typeof defaultVerification === "object" &&
    defaultVerification !== null
  ) {
    verificationFlags = defaultVerification;
  } else {
    verificationFlags = config.amharaBank.defaultVerificationFields;
  }

  const expectedData = config.amharaBank.expectedData;

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

    const expected = expectedData[key];
    const parsed = receiptData[key];

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
