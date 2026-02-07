import pLimit from "p-limit";
import config from "../config/performance.config.js";
import type {
  Awaitable,
  BatchOptions,
  BatchResults,
} from "../types/serviceTypes.js";

export const processBatch = async <T, R>(
  items: T[],
  processor: (item: T) => Awaitable<R | null | undefined | false>,
  options: BatchOptions = {},
): Promise<BatchResults<T, R>> => {
  const concurrency = options.concurrency || config.batch.defaultConcurrency;
  const limit = pLimit(concurrency);

  const results: BatchResults<T, R> = {
    valid: [],
    failed: [],
    total: items.length,
  };

  let processedCount = 0;

  const promises = items.map((item) => {
    return limit(async () => {
      try {
        const result = await processor(item);
        if (result) {
          results.valid.push(result);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : typeof error === "object" && error !== null && "message" in error
              ? String((error as { message?: unknown }).message)
              : typeof error === "string"
                ? error
                : "Unknown error";
        results.failed.push({
          item,
          error: message,
        });
      } finally {
        processedCount++;
        options.onProgress?.(processedCount, items.length);
      }
    });
  });

  await Promise.all(promises);

  return results;
};
