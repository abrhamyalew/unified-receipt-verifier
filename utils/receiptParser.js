const receiptParser = (input) => {
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

export default receiptParser;