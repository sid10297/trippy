import axios from 'axios';
import { useEffect, useState } from 'react';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';
const MAX_POI_COUNT = 5;

const useNearbyPOIs = (userLocation) => {
  const [pointOfInterests, setPointOfInterests] = useState([]);

  const fetchData = async (lat, lon, poiType, radius) => {
    const params = {
      data: `[out:json];(node(around:${radius},${lat},${lon})[amenity=${poiType}];);out;`,
    };

    try {
      const response = await axios.get(OVERPASS_API_URL, { params });
      const filteredList = response.data.elements.slice(0, MAX_POI_COUNT);
      setPointOfInterests(filteredList);
    } catch (error) {
      console.error('Error fetching data from Overpass API:', error.message);
    }
  };

  useEffect(() => {
    if (userLocation) {
      const { latitude, longitude } = userLocation;
      const poiType = 'restaurant';
      const radius = 5000;

      fetchData(latitude, longitude, poiType, radius);
    }
  }, [userLocation]);

  return { pointOfInterests };
};

export default useNearbyPOIs;
