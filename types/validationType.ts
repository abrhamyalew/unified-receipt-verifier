//Amhara bank parsed data, verification flag types

export type amharaBankParsedData = {
  status: string;
  bookingDate?: string;
  amount: string;
  creditorName: string;
  creditAccountId: string;
}

export type amharaBankVerificationFlags = {
  date: boolean;
  amount: boolean;
  recipientName: boolean;
  accountNumber: boolean;
}

//BOA parsed data, verififcation flag type
export type boaParsedData = {
  "Transaction Date": string,
  "Transferred Amount": number | number,
  "Receiver's Name": string,
  "Receiver's Account": string,
}

export type boaVerificationFlags = {
  date: boolean,
  amount: boolean,
  recipientName: boolean,
  accountNumber: boolean,
}