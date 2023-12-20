import { useCallback, useEffect, useState } from 'react';
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from 'react-leaflet';
import useNearbyPOIs from '../../hooks/useNearbyPOIs';

const UserCurrentLocation = () => {
  const [userLocation, setUserLocation] = useState({
    latitude: 51.505,
    longitude: -0.09,
  });
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [osrmCoordinates, setOsrmCoordinates] = useState([]);
  const { pointOfInterests, fetchData } = useNearbyPOIs(userLocation);

  const fetchDataForUserLocation = useCallback(() => {
    if (
      userLocation.latitude !== undefined &&
      userLocation.longitude !== undefined
    ) {
      const { latitude, longitude } = userLocation;
      const poiType = 'restaurant';
      const radius = 5000;

      // Fetch points of interest based on user location
      fetchData(latitude, longitude, poiType, radius)
        .then(() => console.log('fetching'))
        .catch((error) => {
          console.error('Error fetching POIs:', error.message);
        });
    }
  }, [fetchData, userLocation]);

  useEffect(() => {
    fetchDataForUserLocation();
  }, [fetchDataForUserLocation]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        console.error('Error getting geolocation:', error);
        setError(error.message);
        setLoading(false);
      }
    );
  }, []);

  const fetchOsrmCoordinates = useCallback(() => {
    return (lat, lon) => {
      fetch(
        `https://router.project-osrm.org/route/v1/driving/${lon},${lat};${userLocation.longitude},${userLocation.latitude}?overview=full&geometries=geojson`
      )
        .then((response) => response.json())
        .then((data) => {
          setOsrmCoordinates(data.routes[0].geometry.coordinates.slice(1));
        })
        .catch((error) => {
          console.error('Error fetching OSRM coordinates:', error);
        });
    };
  }, [userLocation]);

  useEffect(() => {
    if (selectedPOI) {
      fetchOsrmCoordinates(selectedPOI.lat, selectedPOI.lon);
    }
  }, [selectedPOI, fetchOsrmCoordinates]);

  const navigateToPOI = (poi) => {
    setSelectedPOI(poi);
    const fetchCoordinates = fetchOsrmCoordinates();
    fetchCoordinates(poi.lat, poi.lon);
  };

  return (
    <>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <MapContainer
          center={[userLocation.latitude, userLocation.longitude]}
          zoom={15}
          style={{ height: '400px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[userLocation.latitude, userLocation.longitude]}>
            <Popup>You are here!</Popup>
          </Marker>

          {pointOfInterests.map((poi) => (
            <Marker
              eventHandlers={{ click: () => navigateToPOI(poi) }}
              key={poi.id}
              position={[poi.lat, poi.lon]}
            >
              <Popup>{poi.tags.name}</Popup>
            </Marker>
          ))}

          {selectedPOI && (
            <Polyline
              positions={osrmCoordinates.map((coordinate) => [
                coordinate[1],
                coordinate[0],
              ])}
              color="blue"
            />
          )}
        </MapContainer>
      )}
    </>
  );
};

export default UserCurrentLocation;
