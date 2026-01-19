import { ConnectionTimeOut, NotFoundError } from "../utils/errorHandler.js";
import { Pool } from "undici";

// Create connection pools for each service with optimized settings
const telebirrPool = new Pool("https://transactioninfo.ethiotelecom.et", {
  connections: 50, // Max concurrent connections
  pipelining: 10, // HTTP/1.1 pipelining for faster requests
  keepAliveTimeout: 60000, // Keep connections alive for 60s
  keepAliveMaxTimeout: 600000, // Max keep-alive time
  headersTimeout: 15000, // 10s timeout for receiving headers
  bodyTimeout: 15000, // 10s timeout for receiving body
});

const cbePool = new Pool("https://apps.cbe.com.et:100", {
  connections: 50,
  pipelining: 10,
  keepAliveTimeout: 60000,
  keepAliveMaxTimeout: 600000,
  headersTimeout: 15000,
  bodyTimeout: 15000,
});

const boaPool = new Pool("https://cs.bankofabyssinia.com", {
  connections: 50,
  pipelining: 10,
  keepAliveTimeout: 60000,
  keepAliveMaxTimeout: 600000,
  headersTimeout: 15000,
  bodyTimeout: 15000,
});

const amharaBankPool = new Pool("https://transaction.amharabank.com.et", {
  connections: 50,
  pipelining: 10,
  keepAliveTimeout: 60000,
  keepAliveMaxTimeout: 600000,
  headersTimeout: 15000,
  bodyTimeout: 15000,
});

export const getReceiptData = async (receiptId) => {
  try {
    if (/^[A-Z0-9]{10}$/.test(receiptId)) {
      // Telebirr
      const path = `/receipt/${receiptId}`;
      const { statusCode, body } = await telebirrPool.request({
        path,
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (statusCode !== 200) {
        throw new NotFoundError(
          `Failed to fetch receipt. Status: ${statusCode}`,
        );
      }

      const rawHTML = await body.text();
      return rawHTML;
    } else if (
      /^[A-Z0-9]{12}\d{8}$/.test(receiptId) ||
      /^[A-Z0-9]{12}&\d{8}$/.test(receiptId)
    ) {
      // CBE
      let path;
      if (receiptId.includes("&")) {
        path = `/BranchReceipt/${receiptId}`;
      } else {
        path = `/?id=${receiptId}`;
      }

      const { statusCode, body } = await cbePool.request({
        path,
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (statusCode !== 200) {
        throw new NotFoundError(
          `Failed to fetch receipt. Status: ${statusCode}`,
        );
      }

      // Eagerly consume body to release connection back to pool
      const buffer = await body.arrayBuffer();
      return {
        arrayBuffer: async () => buffer,
      };
    } else if (/^FT\d{5}[A-Z0-9]{5}\d{5}$/.test(receiptId)) {
      // BOA
      const path = `/api/onlineSlip/getDetails/?id=${receiptId}`;

      const { statusCode, body } = await boaPool.request({
        path,
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (statusCode !== 200) {
        throw new NotFoundError(
          `Failed to fetch receipt. Status: ${statusCode}`,
        );
      }

      const parsedResponse = await body.json();

      if (
        !Array.isArray(parsedResponse.body) ||
        parsedResponse.body.length === 0
      ) {
        throw new NotFoundError("Receipt data not found in response");
      }

      return parsedResponse.body[0];
    } else if (/^[A-Z0-9]{12}$/.test(receiptId)) {
      // Amhara Bank
      const path = `/${receiptId}`;

      const { statusCode, body } = await amharaBankPool.request({
        path,
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      if (statusCode !== 200) {
        throw new NotFoundError("Receipt data not found or invalid");
      }

      const parsedResponse = await body.json();

      if (!parsedResponse || parsedResponse.status !== true) {
        throw new NotFoundError("Receipt data not found or invalid");
      }

      return parsedResponse.data;
    }
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw new ConnectionTimeOut(error.message);
  }
};
