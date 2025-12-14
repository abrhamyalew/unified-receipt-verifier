import receiptService from "../services/receiptService.js";
import validationService from "../services/validationService.js";

const batchVerify = async (req, res) => {
  try {
    const { receipt, defaultVerification } = req.body;

    let validReceipts = [];

    for (const element of receipt) {
      if (element) {
        const getRawReceiptData = await receiptService(element);

        const validationResult = validationService(
          getRawReceiptData,
          defaultVerification
        );

        if (validationResult) {
          validReceipts.push(element);
        }

        continue;
      }
      continue;
    }

    return res
      .status(200)
      .json({ message: `"reuslts": ${validReceipts} are valid receipt.` });

  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message });
  }
};

export default batchVerify;
