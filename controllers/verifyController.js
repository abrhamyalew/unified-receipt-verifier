import receiptParser from "../utils/receiptParser.js";
import receiptService from "../services/receiptService.js";
import validationService from "../services/validationService.js";

const getTelebirrReceipt = async (req, res) => {
  try {
    const { receipt, defaultVerification } = req.body;

    const ID = receiptParser(receipt);

    if (!ID) {
      return res.status(400).json({ error: "Invalid Receipt ID" });
    }

    const getRawReceiptData = await receiptService(ID);

    const validationResult = validationService(
      getRawReceiptData,
      defaultVerification
    );

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
