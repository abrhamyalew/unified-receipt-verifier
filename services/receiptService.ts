import {
  ConnectionTimeOut,
  NotFoundError,
  UpstreamServiceError,
} from "../utils/errorHandler.js";
import { Pool } from "undici";
import type { boaParsedData } from "../types/validationType.js";
import type {
  AmharaBankApiResponse,
  BoaApiResponse,
  ReceiptData,
} from "../types/serviceTypes.js";

// Create connection pools for each service with optimized settings
const telebirrPool = new Pool("https://transactioninfo.ethiotelecom.et", {
  connections: 50, // Max concurrent connections
  pipelining: 10, // HTTP/1.1 pipelining for faster requests
  keepAliveTimeout: 60000, // Keep connections alive for 60s
  keepAliveMaxTimeout: 600000, // Max keep-alive time
  headersTimeout: 15000, // 15s timeout for receiving headers
  bodyTimeout: 15000, // 15s timeout for receiving body
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

const hasStatus = (error: unknown): error is { status: number } => {
  if (typeof error !== "object" || error === null || !("status" in error)) {
    return false;
  }
  return typeof (error as { status?: unknown }).status === "number";
};

const extractErrorCode = (error: unknown): string | undefined => {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  if ("code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string") {
      return code;
    }
  }

  if ("cause" in error) {
    const cause = (error as { cause?: unknown }).cause;
    if (typeof cause === "object" && cause !== null && "code" in cause) {
      const causeCode = (cause as { code?: unknown }).code;
      if (typeof causeCode === "string") {
        return causeCode;
      }
    }
  }

  return undefined;
};

const isTimeoutCode = (code: string | undefined): boolean =>
  code === "ETIMEDOUT" ||
  code === "UND_ERR_CONNECT_TIMEOUT" ||
  code === "UND_ERR_HEADERS_TIMEOUT" ||
  code === "UND_ERR_BODY_TIMEOUT";

const isConnectionResetCode = (code: string | undefined): boolean =>
  code === "ECONNRESET" || code === "UND_ERR_SOCKET";

const isUnavailableCode = (code: string | undefined): boolean =>
  code === "ECONNREFUSED" || code === "ENOTFOUND" || code === "EAI_AGAIN";

export const getReceiptData = async (
  receiptId: string,
): Promise<ReceiptData | undefined> => {
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
      let path: string;
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

      const parsedResponse = (await body.json()) as BoaApiResponse<boaParsedData>;

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

      const parsedResponse = (await body.json()) as AmharaBankApiResponse;

      if (!parsedResponse || parsedResponse.status !== true) {
        throw new NotFoundError("Receipt data not found or invalid");
      }

      return parsedResponse.data;
    }
  } catch (error) {
    if (hasStatus(error)) {
      throw error;
    }

    const code = extractErrorCode(error);

    if (isTimeoutCode(code)) {
      throw new ConnectionTimeOut("Upstream receipt service timed out");
    }

    if (isConnectionResetCode(code)) {
      throw new UpstreamServiceError(
        "Upstream receipt service reset the connection",
      );
    }

    if (isUnavailableCode(code)) {
      throw new UpstreamServiceError("Upstream receipt service is unavailable");
    }

    throw new UpstreamServiceError(
      code
        ? `Upstream receipt service error (${code})`
        : "Unexpected upstream receipt service error",
    );
  }
};
