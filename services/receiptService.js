import config from "../config/verification.config.js";


const getTelebirrReceipt = async (receiptId) => {
  try {
    const { api } = config;

    const FULL_API = api?.telebirrBaseUrl + receiptId;

    const response = await fetch(FULL_API);

    if (!response.ok) {
      throw new Error(`Failed to fetch receipt. Status: ${response.status}`);
    }

    const rawHTML = await response.text();

    return rawHTML;
  } catch (error) {
    console.error("Receipt Service Error: ", error);
    throw error;
  }
};

export default getTelebirrReceipt;
