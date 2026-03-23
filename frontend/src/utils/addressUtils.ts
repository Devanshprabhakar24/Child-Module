// Address utility functions for geolocation and PIN code validation

export interface AddressData {
  houseNo: string;
  street: string;
  landmark: string;
  city: string;
  state: string;
  pinCode: string;
  addressType: 'HOME' | 'WORK' | 'OTHER';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PinCodeData {
  pinCode: string;
  city: string;
  state: string;
  district: string;
  country: string;
}

/**
 * Fetch address details from PIN code using India Post API
 */
export const fetchAddressFromPinCode = async (pinCode: string): Promise<PinCodeData | null> => {
  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
    const data = await response.json();

    if (data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
      const postOffice = data[0].PostOffice[0];
      return {
        pinCode,
        city: postOffice.District,
        state: postOffice.State,
        district: postOffice.District,
        country: postOffice.Country,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching PIN code data:", error);
    return null;
  }
};

/**
 * Get current location using browser geolocation API
 */
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    });
  });
};

/**
 * Reverse geocode coordinates to address using Nominatim (OpenStreetMap)
 * Free alternative to Google Maps Geocoding API
 */
export const reverseGeocode = async (lat: number, lng: number): Promise<Partial<AddressData> | null> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'WombTo18-ChildHealth-App',
        },
      }
    );
    const data = await response.json();

    if (data && data.address) {
      const addr = data.address;
      
      return {
        houseNo: addr.house_number || "",
        street: addr.road || addr.street || addr.neighbourhood || "",
        landmark: addr.suburb || "",
        city: addr.city || addr.town || addr.village || addr.state_district || "",
        state: addr.state || "",
        pinCode: addr.postcode || "",
        coordinates: { lat, lng },
      };
    }
    return null;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return null;
  }
};

/**
 * Validate address fields
 */
export const validateAddress = (address: Partial<AddressData>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!address.houseNo?.trim()) {
    errors.push("House/Flat number is required");
  }

  if (!address.street?.trim()) {
    errors.push("Street/Area is required");
  }

  if (!address.city?.trim()) {
    errors.push("City is required");
  }

  if (!address.state?.trim()) {
    errors.push("State is required");
  }

  if (!address.pinCode?.trim()) {
    errors.push("PIN code is required");
  } else if (!/^\d{6}$/.test(address.pinCode)) {
    errors.push("PIN code must be 6 digits");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format address for display
 */
export const formatAddressForDisplay = (address: AddressData): string => {
  const parts = [
    address.houseNo,
    address.street,
    address.landmark,
    address.city,
    address.state,
    address.pinCode,
  ].filter(Boolean);

  return parts.join(", ");
};
