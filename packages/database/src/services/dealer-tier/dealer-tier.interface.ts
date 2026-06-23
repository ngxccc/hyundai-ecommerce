import type { TNewDealerTier, TDealerTier } from "../../schemas";

export interface DealerTierService {
  create(data: TNewDealerTier): Promise<TDealerTier>;
  update(
    id: string,
    data: Partial<TNewDealerTier>,
  ): Promise<TDealerTier | undefined>;
  getAll(): Promise<TDealerTier[]>;
  getById(id: string): Promise<TDealerTier | undefined>;
  delete(id: string): Promise<boolean>;
}
