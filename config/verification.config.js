import dotenv from "dotenv";
dotenv.config();

const config = {
  cbe: {
    // what fields to verify
    defaultVerificationFields: {
      amount: true,
      recipientName: true,
      date: true, //to checks whether the payment happend in the current month and year important to prevent fraud
      accountNumber: true,
    },

    // expected data
    expectedData: {
      amount: process.env.CBE_EXPECTED_AMOUNT || null,
      recipientName: process.env.CBE_EXPECTED_RECIPIENT_NAME || null,
      accountNumber: process.env.CBE_EXPECTED_RECIPIENT_ACCOUNT || null,
      paymentYear: process.env.CBE_EXPECTED_PAYMENT_YEAR || null,
      paymentMonth: process.env.CBE_EXPECTED_PAYMENT_MONTH || null,
    },

    //Validation rules (a wiggle room to tolerate inconsistancies)
    validation: {
      amountTolerance: 0, // Must be exact ammount
      nameCaseSensitive: false,
      allowPartialNameMatch: true,
    },

    //API setting
    api: {
      cbeBaseUrl1: "https://apps.cbe.com.et:100/BranchReceipt/",
      cbeBaseUrl2: "https://apps.cbe.com.et:100/?id=",
      timeout: 5000,
      retries: 3,
    },
  },

  telebirr: {
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
      amount: process.env.TELEBIRR_EXPECTED_AMOUNT || null,
      status: process.env.TELEBIRR_EXPECTED_STATUS || null,
      recipientName: process.env.TELEBIRR_EXPECTED_RECIPIENT_NAME || null,
      accountNumber: process.env.TELEBIRR_EXPECTED_RECIPIENT_ACCOUNT || null,
      paymentYear: process.env.TELEBIRR_EXPECTED_PAYMENT_YEAR || null,
      paymentMonth: process.env.TELEBIRR_EXPECTED_PAYMENT_MONTH || null,
    },
    //Validation rules (a wiggle room to tolerate inconsistencies)
    validation: {
      amountTolerance: 0, // Must be exact amount
      nameCaseSensitive: false,
      allowPartialNameMatch: true,
    },

    //API setting
    api: {
      telebirrBaseUrl: "https://transactioninfo.ethiotelecom.et/receipt/",
      timeout: 5000,
      retries: 3,
    },
  },

  BankO,
};

export default config;
