import { telebirrParser, cbeParser } from "../utils/receiptParser.js";
import { getReceiptData } from "../services/receiptService.js";
import {
  telebirrVerification,
  cbeVerification,
} from "../services/validationService.js";
import { ValidationError } from "../utils/errorHandler.js";


const getTelebirrReceipt = async (req, res) => {
  try {
    const { receipt, defaultVerification } = req.body;

    if (defaultVerification === undefined || receipt === undefined) {
      throw new ValidationError("defaultVerification or receipt missing");
    }

    const trimedReceipt = receipt.trim();
    let ID, getRawReceiptData, validationResult;

    if (
      trimedReceipt.toLowerCase().includes("ethiotelecom") ||
      /^[A-Z0-9]{10}$/.test(trimedReceipt)
    ) {
      ID = telebirrParser(trimedReceipt);

      if (!ID)
        return res.status(400).json({ error: "Invalid TeleBirr Receipt ID" });

      getRawReceiptData = await getReceiptData(ID);

      validationResult = telebirrVerification(
        getRawReceiptData,
        defaultVerification
      );
    } else if (
      trimedReceipt.toLowerCase().includes("cbe") ||
      /^[A-Z0-9]{12}\d{8}$/.test(trimedReceipt) || /^[A-Z0-9]{12}&\d{8}$/.test(trimedReceipt)
    ) {
      ID = cbeParser(trimedReceipt);

      if (!ID) return res.status(400).json({ error: "Invalid CBE Receipt ID" });

      getRawReceiptData = await getReceiptData(ID);

      validationResult = await cbeVerification(
        getRawReceiptData,
        defaultVerification
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
    return res.status(error.status || 500).json({ error: error.message });
  }
};

export default getTelebirrReceipt;
