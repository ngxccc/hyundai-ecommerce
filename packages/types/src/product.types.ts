export interface ProductSpecs {
  model?: string;
  power?: string;
  voltage?: string;
  frequency?: string;
  phase?: "1 Phase" | "3 Phase";
  engine?: string;
  engineBrand?: string;
  alternator?: string;
  alternatorBrand?: string;
  fuelType?: "Diesel" | "Gasoline" | "Gas";
  fuelConsumption?: string;
  fuelTankCapacity?: string;
  weight?: string;
  dimensions?: string;
  noiseLevel?: string;
  warranty?: string;
  ratedCurrent?: string;
  powerFactor?: string;
  startingSystem?: string;
  coolingSystem?: string;
  [key: string]: string | number | boolean | undefined;
}
