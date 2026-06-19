import { getSharedConfig } from "../config";

export const FINANCIAL_CONSTANTS = {
  get VAT_RATE() {
    return getSharedConfig().vatRate;
  },
  get DEPOSIT_RATE() {
    return getSharedConfig().depositRate;
  },
};
