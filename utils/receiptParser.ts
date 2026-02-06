export const telebirrParser = (input: string): string | null => {
  if (!input) return null;

  //case 1: if user puts full URL
  const trimInput = input.trim();

  const id = trimInput.includes("https")
    ? trimInput.split("/receipt/")[1]
    : trimInput; 

  if(!id) return null;

  //case 2: if they pasted the receipt code only
  const pattern = /^[A-Z0-9]{10}$/;

  return pattern.test(id) ? id : null;
};

export const cbeParser = (input: string): string | null => {
  try {
    if (!input) return null;

    const trimInput = input.trim();

    const link = new URL(trimInput);

    if (link.searchParams.toString()) {
      const url = link.searchParams.get("id");

      if(!url) return null;

      const trimmedId = url.trim();

      const pattern = /^[A-Z0-9]{12}\d{8}$/;

      return pattern.test(trimmedId) ? trimmedId : null;

    } else {
      const trimInput = input.trim();

      const id = trimInput.includes("https")
        ? trimInput.split("/BranchReceipt/")[1]
        : trimInput;

        if(!id) return null;

      const pattern = /^[A-Z0-9]{12}&\d{8}$/;
      return pattern.test(id) ? id : null;
    }
  } catch (error) {
    const trimInput = input.trim();

    const queryPattern = /^[A-Z0-9]{12}\d{8}$/;
    const pathPattern = /^[A-Z0-9]{12}&\d{8}$/;

    if (queryPattern.test(trimInput) || pathPattern.test(trimInput)) {
      return trimInput;
    }

    return null;
  }
};

export const boaParser = (input: string): string | null => {
  try {
    if (!input) return null;

    const trimInput = input.trim();

    const link = new URL(trimInput);

    const receiptNumber = link.searchParams.get("trx");

    const pattern = /^FT\d{5}[A-Z0-9]{5}\d{5}$/;

    if (receiptNumber && pattern.test(receiptNumber)) {
      return receiptNumber;
    }

    return null;
  } catch (error) {
    // Handle plain receipt
    const trimInput = input.trim();
    const pattern = /^FT\d{5}[A-Z0-9]{5}\d{5}$/;

    if (pattern.test(trimInput)) {
      return trimInput;
    }

    return null;
  }
};

export const amharaBankParser = (input: string): string | null => {
  try {
    if (!input) return null;

    const trimInput = input.trim();

    const id = trimInput.split("/").pop();

    if(!id) return null

    const isValid = /^[A-Z0-9]{12}$/.test(id);

    return isValid ? id : null;
  } catch {
    const trimInput = input.trim();

    const isvalid = /^[A-Z0-9]{12}$/.test(trimInput);

    return isvalid ? trimInput : null;
  }
};
