import config from "../config/verification.config.js";
import receiptParser from "../utils/receiptParser.js";

const getTellebirrReceipt = async (req, res) => {
  try {
    const { receipt } = req.body;
    const { defaultVerificationFields, defaults, validation, api } = config;

    const ID = receiptParser(receipt);

    if (!ID) {
      return res.status(400).json({ error: "Invalid Receipt ID" });
    }

    const FULL_API = api?.telebirrBaseUrl + ID;

    const response = await fetch(FULL_API);
    const rawHTML = await response.text();

    return res.send(rawHTML);
    
  } catch (error) {
    console.error("Error: ", error);
    return res.status(400).json({ message: "Error: error validating receipt" });
  }
};

export default getTellebirrReceipt;
