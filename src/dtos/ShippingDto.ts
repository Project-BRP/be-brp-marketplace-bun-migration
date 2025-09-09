export interface IRajaOngkirResponse<T> {
  meta: {
    message: string;
    code: number;
    status: string;
  };
  data: T;
}

export interface IProvince {
  id: number;
  name: string;
}

export interface ICity {
  id: number;
  name: string;
  zip_code: string;
}

export interface IDistrict {
  id: number;
  name: string;
  zip_code: string;
}

export interface ISubDistrict {
  id: number;
  name: string;
  zip_code: string;
}

export interface ICostCheckPayload {
  origin: string;
  destination: string;
  weight: number;
  courier: string;
}

export interface IShippingOption {
  name: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

export interface IGetCitiesRequest {
  provinceId: number;
}

export interface IGetDistrictsRequest {
  provinceId: number;
  cityId: number;
}

export interface IGetSubDistrictsRequest {
  provinceId: number;
  cityId: number;
  districtId: number;
}

export interface ICheckCostRequest {
  destinationProvince: number;
  destinationCity: number;
  destinationDistrict: number;
  destinationSubDistrict: number;
  weight_in_kg: number;
}

export interface ICheckCostResponse {
  shippingOptions: IShippingOption[];
}

export interface ITrackShippingRequest {
  transactionId: string;
  userId: string;
  userRole: string;
}

export interface ITrackShippingResponse {
  waybill: IWaybillResponse;
}

export interface ICheckWaybill {
  awb: string;
  courier: string;
  last_phone_number: string;
}

export interface IWaybillSummary {
  courier_code: string;
  courier_name: string;
  waybill_number: string;
  service_code?: string;
  waybill_date: string;
  shipper_name: string;
  receiver_name: string;
  origin: string;
  destination: string;
  status: string;
}

export interface IWaybillDetails {
  waybill_number: string;
  waybill_date: string;
  waybill_time: string;
  weight?: string;
  origin: string;
  destination: string;
  shipper_name: string;
  shipper_address1?: string;
  shipper_address2?: string;
  shipper_address3?: string;
  shipper_city?: string;
  receiver_name: string;
  receiver_address1?: string;
  receiver_address2?: string;
  receiver_address3?: string;
  receiver_city?: string;
}

export interface IWaybillDeliveryStatus {
  status: string;
  pod_receiver: string | null;
  pod_date: string | null;
  pod_time: string | null;
}

export interface IWaybillManifest {
  manifest_code?: string;
  manifest_description: string;
  manifest_date: string;
  manifest_time: string;
  city_name?: string;
}

export interface IWaybillResponse {
  delivered: boolean;
  summary: IWaybillSummary;
  details?: IWaybillDetails;
  delivery_status: IWaybillDeliveryStatus;
  manifest: IWaybillManifest[];
}
