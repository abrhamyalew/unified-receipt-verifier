import { getReceiptData } from "../services/receiptService.js";
import { telebirrVerification } from "../validators/telebirrValidator.js";
import { cbeVerification } from "../validators/cbeValidator.js";
import { boaVerification } from "../validators/boaValidator.js";
import { processBatch } from "../services/batchProcessor.js";
import {
  telebirrParser,
  cbeParser,
  boaParser,
} from "../utils/receiptParser.js";
import { ValidationError } from "../utils/errorHandler.js";
import type { Request, Response } from "express";
import type { ReceiptData } from "../types/serviceTypes.js";
import type { BatchVerifyRequestBody } from "../types/batchControllerType.js";
import type {
  cbeParsedData,
  boaParsedData,
  cbeVerificationFlags,
  boaVerificationFlags,
  telebirrVerificationFlags,
} from "../types/validationType.js";
import type { VerificationFlags } from "../types/verificationControllerTypes.js";

const isCbeResponse = (data: ReceiptData): data is cbeParsedData =>
  typeof data === "object" && data !== null && "arrayBuffer" in data;

const isBoaResponse = (data: ReceiptData): data is boaParsedData =>
  typeof data === "object" && data !== null && "Transaction Date" in data;

const verifySingleReceipt = async (
  receipt: string,
  defaultVerification: VerificationFlags,
): Promise<string | null> => {
  if (!receipt) return null;
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
    // Telebirr
    ID = telebirrParser(trimedReceipt);
    if (!ID) throw new Error("Invalid TeleBirr Receipt ID");

    const getRawReceiptData = await getReceiptData(ID);

    if (!getRawReceiptData || typeof getRawReceiptData !== "string") {
      throw new ValidationError(`Receipt '${receipt}' is not recognized`);
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
    // CBE
    ID = cbeParser(trimedReceipt);
    if (!ID) throw new Error("Invalid CBE Receipt ID");

    const getRawReceiptData = await getReceiptData(ID);

    if (!getRawReceiptData || !isCbeResponse(getRawReceiptData)) {
      throw new ValidationError(`Receipt '${receipt}' is not recognized`);
    }

    validationResult = await cbeVerification(
      getRawReceiptData,
      defaultVerification as cbeVerificationFlags | true,
    );
  } else if (
    trimedReceipt.toLowerCase().includes("bankofabyssinia") ||
    /^FT\d{5}[A-Z0-9]{5}\d{5}$/.test(trimedReceipt)
  ) {
    // BOA
    ID = boaParser(trimedReceipt);
    if (!ID) throw new Error("Invalid BOA Receipt ID");

    const getRawReceiptData = await getReceiptData(ID);

    if (!getRawReceiptData || !isBoaResponse(getRawReceiptData)) {
      throw new ValidationError(`Receipt '${receipt}' is not recognized`);
    }

    validationResult = await boaVerification(
      getRawReceiptData,
      defaultVerification as boaVerificationFlags | true,
    );
  } else {
    throw new ValidationError(`Receipt '${receipt}' is not recognized`);
  }

  if (validationResult) {
    return receipt;
  }
  return null;
};

const batchVerify = async (req: Request, res: Response) => {
  try {
    const { receipt, defaultVerification } = req.body as BatchVerifyRequestBody;

    if (!Array.isArray(receipt)) {
      throw new ValidationError("receipt must be an array");
    }

    if (defaultVerification === undefined || receipt === undefined) {
      throw new ValidationError("defaultVerification is required");
    }

    // Use parallel batch processor
    const results = await processBatch(receipt, (item) =>
      verifySingleReceipt(item, defaultVerification),
    );

    return res.status(200).json({
      result: results.valid,
      failed: results.failed.map((f) => ({
        receiptId: f.item,
        error: f.error,
      })),
      summary: {
        total: results.total,
        valid: results.valid.length,
        invalid: results.failed.length,
      },
    });
  } catch (error) {
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? (error as { status?: number }).status
        : undefined;
    const message = error instanceof Error ? error.message : String(error);
    return res.status(status || 500).json({ error: message });
  }
};

export default batchVerify;
