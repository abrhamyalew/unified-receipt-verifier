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
        defaultVerification,
      );
    } else if (
      trimedReceipt.toLowerCase().includes("cbe") ||
      /^[A-Z0-9]{12}\d{8}$/.test(trimedReceipt) ||
      /^[A-Z0-9]{12}&\d{8}$/.test(trimedReceipt)
    ) {
      ID = cbeParser(trimedReceipt);

      if (!ID) return res.status(400).json({ error: "Invalid CBE Receipt ID" });

      getRawReceiptData = await getReceiptData(ID);

      validationResult = await cbeVerification(
        getRawReceiptData,
        defaultVerification,
      );
    } else if (
      trimedReceipt.toLowerCase().includes("bankofabyssinia") ||
      /^FT\d{5}[A-Z0-9]{5}\d{5}$/.test(trimedReceipt)
    ) {
      ID = boaParser(trimedReceipt);
      if (!ID) return res.status(400).json({ error: "Invalid BOA Receipt ID" });

      getRawReceiptData = await getReceiptData(ID);

      validationResult = await boaVerification(
        getRawReceiptData,
        defaultVerification,
      );
    } else if (
      trimedReceipt.toLowerCase().includes("amharabank") ||
      /^[A-Z0-9]{12}$/.test(trimedReceipt)
    ) {
      ID = amharaBankParser(trimedReceipt);
      if (!ID)
        return res
          .status(400)
          .json({ error: "Invalid Amhara Bank Receipt ID" });

      getRawReceiptData = await getReceiptData(ID);

      validationResult = await amharaBankVerification(
        getRawReceiptData,
        defaultVerification,
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
