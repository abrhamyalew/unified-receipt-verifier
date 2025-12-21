export const telebirrParser = (input) => {
  if (!input || typeof input !== "string") return null;

  //case 1: if user puts full URL
  const trimInput = input.trim();
  let id;

  if (trimInput.includes("https")) {
    id = trimInput.split("/receipt/")[1];
  } else {
    id = trimInput;
  }

  //case 2: if they pasted the receipt code only
  const pattern = /^[A-Z0-9]{10}$/;

  if (pattern.test(id)) {
    return id;
  }

  return null;
};

export const cbeParser = (input) => {
  try {
    if (!input || typeof input !== "string") return null;

    const trimInput = input.trim();

    const link = new URL(trimInput);

    if (link.searchParams.toString()) {
      const url = link.searchParams.get("id");

      const trimInput = url.trim();

      const pattern = /^[A-Z0-9]{12}\d{8}$/;

      if (pattern.test(trimInput)) {
        return trimInput;
      }

      return null;
    } else {
      const trimInput = input.trim();
      let id;

      if (trimInput.includes("https")) {
        id = trimInput.split("/BranchReceipt/")[1];
      } else {
        id = trimInput;
      }

      const pattern = /^[A-Z0-9]{12}&\d{8}$/;

      if (pattern.test(id)) {
        return id;
      }

      return null;
    }
  } catch (error) {
    console.error(error)
  }
};
