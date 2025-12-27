import config from "../config/verification.config.js";
import { ConnectionTimeOut, NotFoundError } from "../utils/errorHandler.js";

export const getReceiptData = async (receiptId) => {
  try {
    if (/^[A-Z0-9]{10}$/.test(receiptId)) {
      const FULL_API = config?.telebirr?.api?.telebirrBaseUrl + receiptId;

      const response = await fetch(FULL_API);

      if (!response.ok) {
        throw new NotFoundError(
          `Failed to fetch receipt. Status: ${response.status}`
        );
      }

      const rawHTML = await response.text();

      return rawHTML;
    } else if (
      /^[A-Z0-9]{12}\d{8}$/.test(receiptId) ||
      /^[A-Z0-9]{12}&\d{8}$/.test(receiptId)
    ) {
      let FULL_API;

      if (receiptId.includes("&")) {
        FULL_API = config?.cbe?.api?.cbeBaseUrl1 + receiptId;
      } else {
        FULL_API = config?.cbe?.api?.cbeBaseUrl2 + receiptId;
      }

      const response = await fetch(FULL_API);

      if (!response.ok) {
        throw new NotFoundError(
          `Failed to fetch receipt. Status: ${response.status}`
        );
      }

      return response;
    } else if (/^FT\d{5}[A-Z0-9]{5}\d{5}$/.test(receiptId)) {
      const FULL_API = config?.BOA?.api?.boaBaseUrl + receiptId;

      const response = await fetch(FULL_API);

      console.log(response);

      if (!response.ok) {
        throw new NotFoundError(
          `Failed to fetch receipt. Status: ${response.status}`
        );
      }

      const parsedResponse = await response.json();
      return parsedResponse;
    }
  } catch (error) {
    if (error.status) {
      throw error;
    }

    throw new ConnectionTimeOut(error.message);
  }
};
