import dotenv from "dotenv";
dotenv.config();

const config = {
  // what feilds to verify
  defaultVerificationFields: {
    amount: true,
    status: true,
    recipientName: true,
    date: false, //to checks weather the payment happend in the current month and year important to prevent fraud
    accountNumber: true,
  },

  // expected data
  expectedData: {
    amount: process.env.EXPECTED_AMOUNT || null,
    status: "Completed",
    recipientName: process.env.EXPECTED_RECIPIENT_NAME || null,
    accountNumber: process.env.EXPECTED_RECIPIENT_ACCOUNT || null,
  },

  //Validation rules (a wiggle room to tolerate inconsistancies)
  validation: {
    amountTolerance: 0, // Must be exact ammount
    nameCaseSensitive: false,
    allowPartialNameMatch: true,
  },

  //API setting
  api: {
    telebirrBaseUrl: "https://transactioninfo.ethiotelecom.et/receipt/",
    timeout: 5000,
    retries: 3,
  },
};

export default config;
