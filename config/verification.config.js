module.exports = {
  // what feilds to verify
  defaultVerificationFields: {
    ammount: true,
    status: true,
    recipientName: true,
    payerName: true
  },

  // expected data
  default: {
    expextedStatus: 'Completed',
    minAmount: null
  },

  //Validation rules (a wiggle room to tolerate inconsistancies)
  validation: {
    ammountTolerance: 0, // Must be exact ammount
    nameCaseSensitive: false, 
    allowPartialNameMatch: true
  },

  //API setting
  api: {
    telebirrBaseUrl: 'https://transactioninfo.ethiotelecom.et/receipt/',
    timeout: 5000,
    retries: 3
  }
}