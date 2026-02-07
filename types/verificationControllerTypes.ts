import type {
  cbeVerificationFlags,
  amharaBankVerificationFlags,
  boaVerificationFlags,
  telebirrVerificationFlags,
} from "./validationType.js";

export type VerificationFlags =
  | true
  | telebirrVerificationFlags
  | cbeVerificationFlags
  | boaVerificationFlags
  | amharaBankVerificationFlags;

export type VerifyRequestBody = {
  receipt: string;
  defaultVerification: VerificationFlags;
};
