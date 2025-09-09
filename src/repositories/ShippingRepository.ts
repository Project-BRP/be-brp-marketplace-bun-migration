import { IProvince, ICity, IDistrict, ISubDistrict } from '../dtos';
import { redisClient } from '../configs/redis';
import { ShippingUtils } from '../utils';

const CACHE_TTL = 60 * 60 * 24;

export class ShippingRepository {
  static async setProvinces(provinces: IProvince[]) {
    return await redisClient.set(
      `rajaongkir:provinces`,
      JSON.stringify(provinces),
      { EX: CACHE_TTL },
    );
  }

  static async getProvinces() {
    let provinces: IProvince[] = [];
    const cachedProvinces = await redisClient.get(`rajaongkir:provinces`);

    if (cachedProvinces) {
      try {
        provinces = JSON.parse(cachedProvinces);
      } catch {
        provinces = [];
      }
    } else {
      try {
        provinces = await ShippingUtils.fetchProvinces();
        await redisClient.set(
          `rajaongkir:provinces`,
          JSON.stringify(provinces),
          { EX: CACHE_TTL },
        );
      } catch {
        provinces = [];
      }
    }

    return provinces;
  }

  static async getProvince(id: number) {
    const provinces = await this.getProvinces();
    return provinces.find((province: IProvince) => province.id === id) || null;
  }

  static async setCities(provinceId: number, cities: ICity[]) {
    return await redisClient.set(
      `rajaongkir:cities:${provinceId}`,
      JSON.stringify(cities),
      { EX: CACHE_TTL },
    );
  }

  static async getCities(provinceId: number) {
    let cities: ICity[] = [];
    const cachedCities = await redisClient.get(
      `rajaongkir:cities:${provinceId}`,
    );

    if (cachedCities) {
      try {
        cities = JSON.parse(cachedCities);
      } catch {
        cities = [];
      }
    } else {
      try {
        cities = await ShippingUtils.fetchCities(provinceId);
        await redisClient.set(
          `rajaongkir:cities:${provinceId}`,
          JSON.stringify(cities),
          { EX: CACHE_TTL },
        );
      } catch {
        cities = [];
      }
    }

    return cities;
  }

  static async getCity(provinceId: number, cityId: number) {
    const cities = await this.getCities(provinceId);
    return cities.find((city: ICity) => city.id === cityId) || null;
  }

  static async setDistricts(cityId: number, districts: IDistrict[]) {
    return await redisClient.set(
      `rajaongkir:districts:${cityId}`,
      JSON.stringify(districts),
      { EX: CACHE_TTL },
    );
  }

  static async getDistricts(cityId: number) {
    let districts: IDistrict[] = [];
    const cachedDistricts = await redisClient.get(
      `rajaongkir:districts:${cityId}`,
    );

    if (cachedDistricts) {
      try {
        districts = JSON.parse(cachedDistricts);
      } catch {
        districts = [];
      }
    } else {
      try {
        districts = await ShippingUtils.fetchDistricts(cityId);
        await redisClient.set(
          `rajaongkir:districts:${cityId}`,
          JSON.stringify(districts),
          { EX: CACHE_TTL },
        );
      } catch {
        districts = [];
      }
    }

    return districts;
  }

  static async getDistrict(cityId: number, districtId: number) {
    const districts = await this.getDistricts(cityId);
    return (
      districts.find((district: IDistrict) => district.id === districtId) ||
      null
    );
  }

  static async setSubDistricts(
    districtId: number,
    subDistricts: ISubDistrict[],
  ) {
    return await redisClient.set(
      `rajaongkir:subdistricts:${districtId}`,
      JSON.stringify(subDistricts),
      { EX: CACHE_TTL },
    );
  }

  static async getSubDistricts(districtId: number) {
    let subDistricts: ISubDistrict[] = [];
    const cachedSubDistricts = await redisClient.get(
      `rajaongkir:subdistricts:${districtId}`,
    );

    if (cachedSubDistricts) {
      try {
        subDistricts = JSON.parse(cachedSubDistricts);
      } catch {
        subDistricts = [];
      }
    } else {
      try {
        subDistricts = await ShippingUtils.fetchSubDistricts(districtId);
        await redisClient.set(
          `rajaongkir:subdistricts:${districtId}`,
          JSON.stringify(subDistricts),
          { EX: CACHE_TTL },
        );
      } catch {
        subDistricts = [];
      }
    }

    return subDistricts;
  }

  static async getSubDistrict(districtId: number, subDistrictId: number) {
    const subDistricts = await this.getSubDistricts(districtId);
    return (
      subDistricts.find(
        (subDistrict: ISubDistrict) => subDistrict.id === subDistrictId,
      ) || null
    );
  }
}
