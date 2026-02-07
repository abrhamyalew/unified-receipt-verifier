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

//cbe parsed data adn validation flag
export type cbeParsedData = {
  arrayBuffer: () => Promise<ArrayBuffer>;
}

export type cbeVerificationFlags = {
  amount: boolean,
  date: boolean,
  recipientName: boolean,
  accountNumber: boolean,
}

//telebirr parsed data adn validation flag
export type telebirrParsedData = {
  amount: string,
  status: string,
  recipientName: string,
  date: string,
  accountNumber: string
}

export type telebirrVerificationFlags = {
  amount: boolean,
  status: boolean,
  recipientName: boolean,
  accountNumber: boolean,
  date: boolean,
}