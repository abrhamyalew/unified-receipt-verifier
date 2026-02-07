import type { VerificationFlags } from "./verificationControllerTypes.js";

export type BatchVerifyRequestBody = {
  receipt: string[];
  defaultVerification: VerificationFlags;
};

export type BatchVerifyFailedItem = {
  receiptId: string;
  error: string;
};

export type BatchVerifyResponse = {
  result: string[];
  failed: BatchVerifyFailedItem[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
};
