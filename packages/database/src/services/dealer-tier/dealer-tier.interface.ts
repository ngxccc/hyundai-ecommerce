import type { NewDealerTier, DealerTier } from "../../schemas";

export interface DealerTierService {
  create(data: NewDealerTier): Promise<DealerTier>;
  update(
    id: string,
    data: Partial<NewDealerTier>,
  ): Promise<DealerTier | undefined>;
  getAll(): Promise<DealerTier[]>;
  getById(id: string): Promise<DealerTier | undefined>;
  delete(id: string): Promise<boolean>;
}
