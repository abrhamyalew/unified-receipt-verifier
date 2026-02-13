import {
  telebirrParser,
  cbeParser,
  boaParser,
  amharaBankParser,
} from "../utils/receiptParser.js";
import { getReceiptData } from "../services/receiptService.js";
import { telebirrVerification } from "../validators/telebirrValidator.js";
import { cbeVerification } from "../validators/cbeValidator.js";
import { boaVerification } from "../validators/boaValidator.js";
import { amharaBankVerification } from "../validators/amharabankValidator.js";
import { ValidationError } from "../utils/errorHandler.js";
import type { Request, Response } from "express";
import type { ReceiptData } from "../types/serviceTypes.js";
import type {
  cbePdfData,
  boaParsedData,
  amharaBankParsedData,
  cbeVerificationFlags,
  amharaBankVerificationFlags,
  boaVerificationFlags,
  telebirrVerificationFlags,
} from "../types/validationType.js";
import type {
  VerificationFlags,
  VerifyRequestBody,
} from "../types/verificationControllerTypes.js";

const isCbeResponse = (data: ReceiptData): data is cbePdfData =>
  typeof data === "object" && data !== null && "arrayBuffer" in data;

const isBoaResponse = (data: ReceiptData): data is boaParsedData =>
  typeof data === "object" && data !== null && "Transaction Date" in data;

const isAmharaResponse = (data: ReceiptData): data is amharaBankParsedData =>
  typeof data === "object" && data !== null && "creditAccountId" in data;

const getTelebirrReceipt = async (req: Request, res: Response) => {
  try {
    const { receipt, defaultVerification } = req.body as VerifyRequestBody;

    if (defaultVerification === undefined || receipt === undefined) {
      throw new ValidationError("defaultVerification or receipt missing");
    }

    if (typeof receipt !== "string") {
      throw new ValidationError("receipt must be a string");
    }

    const trimedReceipt = receipt.trim();
    let ID: string | null = null;
    let validationResult = false;

    if (
      trimedReceipt.toLowerCase().includes("ethiotelecom") ||
      /^[A-Z0-9]{10}$/.test(trimedReceipt)
    ) {
      ID = telebirrParser(trimedReceipt);

      if (!ID)
        return res.status(400).json({ error: "Invalid TeleBirr Receipt ID" });

      const getRawReceiptData = await getReceiptData(ID);

      if (!getRawReceiptData || typeof getRawReceiptData !== "string") {
        throw new ValidationError(`receipt '${receipt}' is NOT a valid receipt`);
      }

      validationResult = telebirrVerification(
        getRawReceiptData,
        defaultVerification as telebirrVerificationFlags | true,
      );
    } else if (
      trimedReceipt.toLowerCase().includes("cbe") ||
      /^[A-Z0-9]{12}\d{8}$/.test(trimedReceipt) ||
      /^[A-Z0-9]{12}&\d{8}$/.test(trimedReceipt)
    ) {
      ID = cbeParser(trimedReceipt);

      if (!ID) return res.status(400).json({ error: "Invalid CBE Receipt ID" });

      const getRawReceiptData = await getReceiptData(ID);

      if (!getRawReceiptData || !isCbeResponse(getRawReceiptData)) {
        throw new ValidationError(`receipt '${receipt}' is NOT a valid receipt`);
      }

      validationResult = await cbeVerification(
        getRawReceiptData,
        defaultVerification as cbeVerificationFlags | true,
      );
    } else if (
      trimedReceipt.toLowerCase().includes("bankofabyssinia") ||
      /^FT\d{5}[A-Z0-9]{5}\d{5}$/.test(trimedReceipt)
    ) {
      ID = boaParser(trimedReceipt);
      if (!ID) return res.status(400).json({ error: "Invalid BOA Receipt ID" });

      const getRawReceiptData = await getReceiptData(ID);

      if (!getRawReceiptData || !isBoaResponse(getRawReceiptData)) {
        throw new ValidationError(`receipt '${receipt}' is NOT a valid receipt`);
      }

      validationResult = await boaVerification(
        getRawReceiptData,
        defaultVerification as boaVerificationFlags | true,
      );
    } else if (
      trimedReceipt.toLowerCase().includes("amharabank") ||
      /^[A-Z0-9]{12}$/.test(trimedReceipt)
    ) {
      ID = amharaBankParser(trimedReceipt);
      if (!ID)
        return res
          .status(400)
          .json({ error: "Invalid Amhara Bannk Receipt ID" });

      const getRawReceiptData = await getReceiptData(ID);

      if (!getRawReceiptData || !isAmharaResponse(getRawReceiptData)) {
        throw new ValidationError(`receipt '${receipt}' is NOT a valid receipt`);
      }

      validationResult = await amharaBankVerification(
        getRawReceiptData,
        defaultVerification as amharaBankVerificationFlags | true,
      );
    } else {
      throw new ValidationError(`receipt '${receipt}' is NOT a valid receipt`);
    }

    if (validationResult) {
      return res
        .status(200)
        .json({ message: `The receipt '${ID}' is a valid receipt.` });
    }
  } catch (error) {
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? (error as { status?: number }).status
        : undefined;
    const message = error instanceof Error ? error.message : String(error);
    return res.status(status || 500).json({ error: message });
  }
};

export default getTelebirrReceipt;
