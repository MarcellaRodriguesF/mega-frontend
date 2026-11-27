
export interface Coordinates {
    latitude: number;
    longitude: number;
  }
  
  function convertDmsToDecimal(
    degrees: string,
    minutes: string,
    seconds: string,
    direction: string,
  ): number {
    const value =
      Math.abs(Number(degrees)) +
      Number(minutes) / 60 +
      Number(seconds.replace(",", ".")) / 3600;
  
    return ["S", "W"].includes(direction.toUpperCase())
      ? -value
      : value;
  }
  
  export function parseCoordinatePair(
    input: string,
  ): Coordinates | null {
    const value = input.trim();
  
    if (!value) return null;
  
    // Formato DMS: 23°02'25.2"S 45°42'11.8"W
    const dmsRegex =
      /(-?\d+(?:[.,]\d+)?)\s*[°º]\s*(\d+(?:[.,]\d+)?)\s*['′’]\s*(\d+(?:[.,]\d+)?)\s*["″”]?\s*([NSEW])/gi;
  
    const dmsMatches = [...value.matchAll(dmsRegex)];
  
    if (dmsMatches.length === 2) {
      const coordinates = dmsMatches.map((match) =>
        convertDmsToDecimal(
          match[1].replace(",", "."),
          match[2].replace(",", "."),
          match[3].replace(",", "."),
          match[4],
        ),
      );
  
      const directions = dmsMatches.map((match) =>
        match[4].toUpperCase(),
      );
  
      const latitudeIndex = directions.findIndex(
        (direction) => direction === "N" || direction === "S",
      );
  
      const longitudeIndex = directions.findIndex(
        (direction) => direction === "E" || direction === "W",
      );
  
      if (latitudeIndex === -1 || longitudeIndex === -1) {
        return null;
      }
  
      const latitude = coordinates[latitudeIndex];
      const longitude = coordinates[longitudeIndex];
  
      if (
        Math.abs(latitude) > 90 ||
        Math.abs(longitude) > 180
      ) {
        return null;
      }
  
      return { latitude, longitude };
    }
  
    // Formato decimal: -23.040324, -45.703289
    const decimalMatches = value.match(/-?\d+(?:\.\d+)?/g);
  
    if (!decimalMatches || decimalMatches.length !== 2) {
      return null;
    }
  
    const latitude = Number(decimalMatches[0]);
    const longitude = Number(decimalMatches[1]);
  
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180
    ) {
      return null;
    }
  
    return { latitude, longitude };
  }
  