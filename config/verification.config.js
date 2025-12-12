import dotenv from "dotenv";
dotenv.config();

const config = {
  // what feilds to verify
  defaultVerificationFields: {
    amount: true,
    status: true,
    recipientName: true,
    date: true, //to checks weather the payment happend in the current month and year important to prevent fraud
    accountNumber: true,
  },

  // expected data
  expectedData: {
    amount: process.env.EXPECTED_AMOUNT || null,
    status: process.env.EXPECTED_STATUS || null,
    recipientName: process.env.EXPECTED_RECIPIENT_NAME || null,
    accountNumber: process.env.EXPECTED_RECIPIENT_ACCOUNT || null,
    paymentYear: process.env.EXPECTED_PAYMENT_YEAR || null,
    paymentMonth: process.env.EXPECTED_PAYMENT_MONTH || null,
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
