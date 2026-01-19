import { getReceiptData } from "../services/receiptService.js";
import { telebirrVerification } from "../validators/telebirrValidator.js";
import { cbeVerification } from "../validators/cbeValidator.js";
import { boaVerification } from "../validators/boaValidator.js";
import { amharaBankVerification } from "../validators/amharabankValidator.js";
import { processBatch } from "../services/batchProcessor.js";
import {
  telebirrParser,
  cbeParser,
  boaParser,
  amharaBankParser,
} from "../utils/receiptParser.js";
import { ValidationError } from "../utils/errorHandler.js";

const verifySingleReceipt = async (receipt, defaultVerification) => {
  if (!receipt) return null;

  const trimedReceipt = receipt.trim();
  let ID, getRawReceiptData, validationResult;

  if (
    trimedReceipt.toLowerCase().includes("ethiotelecom") ||
    /^[A-Z0-9]{10}$/.test(trimedReceipt)
  ) {
    // Telebirr
    ID = telebirrParser(trimedReceipt);
    if (!ID) throw new Error("Invalid TeleBirr Receipt ID");

    getRawReceiptData = await getReceiptData(ID);
    validationResult = telebirrVerification(
      getRawReceiptData,
      defaultVerification,
    );
  } else if (
    trimedReceipt.toLowerCase().includes("cbe") ||
    /^[A-Z0-9]{12}\d{8}$/.test(trimedReceipt) ||
    /^[A-Z0-9]{12}&\d{8}$/.test(trimedReceipt)
  ) {
    // CBE
    ID = cbeParser(trimedReceipt);
    if (!ID) throw new Error("Invalid CBE Receipt ID");

    getRawReceiptData = await getReceiptData(ID);
    validationResult = await cbeVerification(
      getRawReceiptData,
      defaultVerification,
    );
  } else if (
    trimedReceipt.toLowerCase().includes("bankofabyssinia") ||
    /^FT\d{5}[A-Z0-9]{5}\d{5}$/.test(trimedReceipt)
  ) {
    // BOA
    ID = boaParser(trimedReceipt);
    if (!ID) throw new Error("Invalid BOA Receipt ID");

    getRawReceiptData = await getReceiptData(ID);
    validationResult = await boaVerification(
      getRawReceiptData,
      defaultVerification,
    );
  } else if (
    trimedReceipt.toLowerCase().includes("amharabank") ||
    /^[A-Z0-9]{12}$/.test(trimedReceipt)
  ) {
    // Amhara Bank
    ID = amharaBankParser(trimedReceipt);
    if (!ID) throw new Error("Invalid Amhara Bank Receipt ID");

    getRawReceiptData = await getReceiptData(ID);
    validationResult = await amharaBankVerification(
      getRawReceiptData,
      defaultVerification,
    );
  } else {
    throw new ValidationError(`Receipt '${receipt}' is not recognized`);
  }

  if (validationResult) {
    return receipt;
  }
  return null;
};

const batchVerify = async (req, res) => {
  try {
    const { receipt, defaultVerification } = req.body;

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
    return res.status(error.status || 500).json({ error: error.message });
  }
};

export default batchVerify;
