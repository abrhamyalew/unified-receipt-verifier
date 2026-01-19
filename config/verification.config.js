import dotenv from "dotenv";
dotenv.config();

const config = {
  cbe: {
    // Fields to verify
    defaultVerificationFields: {
      amount: true,
      recipientName: true,
      date: true, // Validates payment month/year to prevent fraud
      accountNumber: true,
    },

    // Expected values from environment
    expectedData: {
      amount: process.env.CBE_EXPECTED_AMOUNT || null,
      recipientName: process.env.CBE_EXPECTED_RECIPIENT_NAME || null,
      accountNumber: process.env.CBE_EXPECTED_RECIPIENT_ACCOUNT || null,
      paymentYear: process.env.CBE_EXPECTED_PAYMENT_YEAR || null,
      paymentMonth: process.env.CBE_EXPECTED_PAYMENT_MONTH || null,
    },

    // Validation rules
    validation: {
      amountTolerance: 0, // Must be exact amount
      nameCaseSensitive: false,
      allowPartialNameMatch: true,
    },

    // API configuration
    api: {
      cbeBaseUrl1: "https://apps.cbe.com.et:100/BranchReceipt/",
      cbeBaseUrl2: "https://apps.cbe.com.et:100/?id=",
      timeout: 5000,
      retries: 3,
    },
  },

  telebirr: {
    // Fields to verify
    defaultVerificationFields: {
      amount: true,
      status: true,
      recipientName: true,
      date: true, // Validates payment month/year to prevent fraud
      accountNumber: true,
    },

    // Expected values from environment
    expectedData: {
      amount: process.env.TELEBIRR_EXPECTED_AMOUNT || null,
      status: process.env.TELEBIRR_EXPECTED_STATUS || null,
      recipientName: process.env.TELEBIRR_EXPECTED_RECIPIENT_NAME || null,
      accountNumber: process.env.TELEBIRR_EXPECTED_RECIPIENT_ACCOUNT || null,
      paymentYear: process.env.TELEBIRR_EXPECTED_PAYMENT_YEAR || null,
      paymentMonth: process.env.TELEBIRR_EXPECTED_PAYMENT_MONTH || null,
    },
    // Validation rules
    validation: {
      amountTolerance: 0, // Must be exact amount
      nameCaseSensitive: false,
      allowPartialNameMatch: true,
    },

    // API configuration
    api: {
      telebirrBaseUrl: "https://transactioninfo.ethiotelecom.et/receipt/",
      timeout: 5000,
      retries: 3,
    },
  },

  boa: {
    // Fields to verify
    defaultVerificationFields: {
      amount: true,
      recipientName: true,
      date: true, // Validates payment month/year to prevent fraud
      accountNumber: true,
    },

    // Expected values from environment
    expectedData: {
      amount: process.env.BOA_EXPECTED_AMOUNT || null,
      recipientName: process.env.BOA_EXPECTED_RECIPIENT_NAME || null,
      accountNumber: process.env.BOA_EXPECTED_RECIPIENT_ACCOUNT || null,
      paymentYear: process.env.BOA_EXPECTED_PAYMENT_YEAR || null,
      paymentMonth: process.env.BOA_EXPECTED_PAYMENT_MONTH || null,
    },
    // Validation rules
    validation: {
      amountTolerance: 0, // Must be exact amount
      nameCaseSensitive: false,
      allowPartialNameMatch: true,
    },

    // API configuration
    api: {
      boaBaseUrl:
        "https://cs.bankofabyssinia.com/api/onlineSlip/getDetails/?id=",
      timeout: 5000,
      retries: 3,
    },
  },

  amharaBank: {
    // Fields to verify
    defaultVerificationFields: {
      amount: true,
      recipientName: true,
      date: true, // Validates payment month/year to prevent fraud
      accountNumber: true,
    },

    // Expected values from environment
    expectedData: {
      amount: process.env.AB_EXPECTED_AMOUNT || null,
      recipientName: process.env.AB_EXPECTED_RECIPIENT_NAME || null,
      accountNumber: process.env.AB_EXPECTED_RECIPIENT_ACCOUNT || null,
      paymentYear: process.env.AB_EXPECTED_PAYMENT_YEAR || null,
      paymentMonth: process.env.AB_EXPECTED_PAYMENT_MONTH || null,
    },
    // Validation rules
    validation: {
      amountTolerance: 0, // Must be exact amount
      nameCaseSensitive: false,
      allowPartialNameMatch: true,
    },

    // API configuration
    api: {
      boaBaseUrl: "https://transaction.amharabank.com.et/",
      timeout: 5000,
      retries: 3,
    },
  },
};

export default config;
