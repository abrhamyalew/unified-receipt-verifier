const config = {
  // what feilds to verify
  defaultVerificationFields: {
    amount: true,
    status: true,
    recipientName: true,
    payerName: true,
  },

  // expected data
  defaults: {
    expectedStatus: "Completed",
    minAmount: null,
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
