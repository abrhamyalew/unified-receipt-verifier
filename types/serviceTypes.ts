import type {
  amharaBankParsedData,
  boaParsedData,
  cbePdfData,
  cbeMbParsedData,
} from "./validationType.js";

export type Awaitable<T> = T | Promise<T>;

export type BatchFailure<T> = {
  item: T;
  error: string;
};

export type BatchResults<T, R> = {
  valid: R[];
  failed: BatchFailure<T>[];
  total: number;
};

export type BatchOptions = {
  concurrency?: number;
  onProgress?: (processed: number, total: number) => void;
};

export type BoaApiResponse<T> = {
  body: T[];
};

export type AmharaBankApiResponse = {
  status: boolean;
  data: amharaBankParsedData;
};

export type ReceiptData =
  | string
  | cbePdfData
  | cbeMbParsedData
  | boaParsedData
  | amharaBankParsedData;
