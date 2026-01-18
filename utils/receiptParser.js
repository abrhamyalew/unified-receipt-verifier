import { validationResult } from "express-validator";
import { ValidationError } from "./errorHandler.js";

export const telebirrParser = (input) => {
  if (!input || typeof input !== "string") return null;

  //case 1: if user puts full URL
  const trimInput = input.trim();
  let id;

  if (trimInput.includes("https")) {
    id = trimInput.split("/receipt/")[1];
  } else {
    id = trimInput;
  }

  //case 2: if they pasted the receipt code only
  const pattern = /^[A-Z0-9]{10}$/;

  if (pattern.test(id)) {
    return id;
  }

  return null;
};

export const cbeParser = (input) => {
  try {
    if (!input || typeof input !== "string") return null;

    const trimInput = input.trim();

    const link = new URL(trimInput);

    if (link.searchParams.toString()) {
      const url = link.searchParams.get("id");

      const trimInput = url.trim();

      const pattern = /^[A-Z0-9]{12}\d{8}$/;

      if (pattern.test(trimInput)) {
        return trimInput;
      }

      return null;
    } else {
      const trimInput = input.trim();
      let id;

      if (trimInput.includes("https")) {
        id = trimInput.split("/BranchReceipt/")[1];
      } else {
        id = trimInput;
      }

      const pattern = /^[A-Z0-9]{12}&\d{8}$/;

      if (pattern.test(id)) {
        return id;
      }

      return null;
    }
  } catch (error) {
    const trimInput = input.trim();

    const queryPattern = /^[A-Z0-9]{12}\d{8}$/;
    const pathPattern = /^[A-Z0-9]{12}&\d{8}$/;

    if (queryPattern.test(trimInput) || pathPattern.test(trimInput)) {
      return trimInput;
    }

    return null;
  }
};

export const boaParser = (input) => {
  try {
    if (!input || typeof input !== "string") return null;

    const trimInput = input.trim();

    const link = new URL(trimInput);

    const receiptNumber = link.searchParams.get("trx");

    const pattern = /^FT\d{5}[A-Z0-9]{5}\d{5}$/;

    if (receiptNumber && pattern.test(receiptNumber)) {
      return receiptNumber;
    }

    return null;
  } catch (error) {
    // Handle plain receipt
    const trimInput = input.trim();
    const pattern = /^FT\d{5}[A-Z0-9]{5}\d{5}$/;

    if (pattern.test(trimInput)) {
      return trimInput;
    }

    return null;
  }
};


export const amharaBankParser = (input) => {
  try {
    if (!input || typeof input !== "string") return null;

    const trimInput = input.trim();

    const id = trimInput.split("/").pop();

    const isValid = /([A-Z0-9]{12})/.test(id);

    return isValid ? id : null;

  } catch {
    const trimInput = input.trim();

    const isvalid = /([A-Z0-9]{12})/.test(trimInput);

    return isvalid ? trimInput : null;
  }
};
