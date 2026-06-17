import { type TUserAddress } from "../schemas/user-address.schema";

export type AddressDTO = Omit<
  TUserAddress,
  "userId" | "createdAt" | "updatedAt" | "deletedAt"
>;

export type CreateAddressDTO = Omit<AddressDTO, "id" | "isDefault"> & {
  userId: string;
  isDefault?: boolean;
};

export type UpdateAddressDTO = Partial<Omit<AddressDTO, "id">>;

export function mapAddressToDTO(address: TUserAddress): AddressDTO {
  return {
    id: address.id,
    receiverName: address.receiverName,
    phoneNumber: address.phoneNumber,
    streetAddress: address.streetAddress,
    district: address.district,
    city: address.city,
    isDefault: address.isDefault,
  };
}
