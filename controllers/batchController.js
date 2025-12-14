import receiptService from "../services/receiptService.js";
import validationService from "../services/validationService.js";
import { ValidationError } from "../utils/errorHandler.js";

const batchVerify = async (req, res) => {
  try {
    const { receipt, defaultVerification } = req.body;

    if (!Array.isArray(receipt)) {
      throw new ValidationError("receipt must be an array");
    }

    if (defaultVerification === undefined || receipt === undefined) {
      throw new ValidationError("defaultVerification is required");
    }

    let validReceipts = [];
    let failedReceipts = [];

    for (const element of receipt) {
      if (element) {
        const getRawReceiptData = await receiptService(element);

        const validationResult = validationService(
          getRawReceiptData,
          defaultVerification
        );

        if (validationResult) {
          validReceipts.push(element);
        } else {
          failedReceipts.push(element);
        }
      }
    }

    return res.status(200).json({ 
      result: validReceipts,
      summary: {
        total: receipt.length,
        valid: validReceipts.length,
        invalid: receipt.length - validReceipts.length
      } 
    });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
};

export default batchVerify;
