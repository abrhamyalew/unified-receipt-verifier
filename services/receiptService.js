import config from "../config/verification.config.js";
import { ConnectionTimeOut, NotFoundError } from "../utils/errorHandler.js";

const getTelebirrReceipt = async (receiptId) => {
  try {
    const { api } = config;

    const FULL_API = api?.telebirrBaseUrl + receiptId;

    const response = await fetch(FULL_API);

    if (!response.ok) {
      throw new NotFoundError(
        `Failed to fetch receipt. Status: ${response.status}`
      );
    }

    const rawHTML = await response.text();

    return rawHTML;
  } catch (error) {
    if (error.status) {
      throw error;
    }

    throw new ConnectionTimeOut(error.message);
  }
};

export default getTelebirrReceipt;
