import { promisify } from "util";
import redis from "../../../lib/redis";
import logger from "../../../logger/logger";
import validatedEnv from "../../../config/environmentVariables";

// Assuming you have already created a Redis client

// Promisify Redis commands
// const geoaddAsync = promisify(redis.geoadd).bind(redis);
// const geoposAsync = promisify(redis.geopos).bind(redis);
// const georadiusAsync = promisify(redis.georadius).bind(redis);
// const delAsync = promisify(redis.del).bind(redis);
const key = "location";
export default class LocationService {
  public static async createLocation(
    longitude: number,
    latitude: number,
    name: string
  ) {
    try {
      // Use geoadd to add the location to Redis
      const addLocation = await redis.geoadd(
        "location",
        longitude,
        latitude,
        name
      );
      logger.info(addLocation);
    } catch (error) {
      console.error("Error creating location:", error);
      throw error; // Rethrow the error for handling elsewhere
    }
  }

  public static async getLocationCoordinates(name: string) {
    try {
      // Use geopos to get the coordinates of a location from Redis
      const coordinates = await redis.geopos(key, name);
      return coordinates;
    } catch (error) {
      console.error("Error getting location coordinates:", error);
      throw error; // Rethrow the error for handling elsewhere
    }
  }

  public static async getLocationsWithinRadius(
    longitude: number,
    latitude: number,
    radius: number
  ) {
    try {
      // Use georadius to get locations within a certain radius from Redis
      const locations = await redis.georadius(
        key,
        longitude,
        latitude,
        radius,
        "km",
        "WITHCOORD",
        "WITHDIST"
      );
      return locations;
    } catch (error) {
      console.error("Error getting locations within radius:", error);
      throw error; // Rethrow the error for handling elsewhere
    }
  }

  public static async deleteLocation(name: string) {
    try {
      // Use del to delete a location from Redis
      await redis.del(key, name);
    } catch (error) {
      console.error("Error deleting location:", error);
      throw error; // Rethrow the error for handling elsewhere
    }
  }
  public static async locationDistance(userId: string, vendorId: string) {
    try {
      return await redis.geodist(key, userId, vendorId, "KM");
    } catch (error) {
      console.error("Error deleting location:", error);
      throw error; // Rethrow the error for handling elsewhere
    }
  }
  // public static async getLocationName(lat: number, lng: number) {
  //   try {
  //     logger.info("getLocationName");
  //     const response = await fetch(
  //       `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${validatedEnv.GOOGLE_MAPS_API_KEY}`
  //     );
  //     const data = await response.json();
  //     logger.info(data);
  //     return data;
  //   } catch (error) {
  //     console.error("Error deleting location:", error);
  //     throw error; // Rethrow the error for handling elsewhere
  //   }
  // }

  // You can add more methods as needed
}
