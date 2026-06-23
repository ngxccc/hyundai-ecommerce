import type { AddressDTO, CreateAddressDTO, UpdateAddressDTO } from "../../dtos";

export interface AddressService {
  getByUserId(userId: string): Promise<AddressDTO[]>;
  create(address: CreateAddressDTO): Promise<{ id: string }>;
  update(
    id: string,
    userId: string,
    address: UpdateAddressDTO,
  ): Promise<{ id: string }>;
  delete(id: string, userId: string): Promise<boolean>;
  setDefault(id: string, userId: string): Promise<void>;
}
