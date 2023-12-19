import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import useNearbyPOIs from '../../hooks/useNearbyPOIs';

const UserCurrentLocation = () => {
  const [userLocation, setUserLocation] = useState({
    latitude: 51.505,
    longitude: -0.09,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation(() => ({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setLoading(false);
      },
      (error) => {
        console.error('Error getting geolocation:', error);
        setError(error.message);
        setLoading(false);
      }
    );
  }, []);

  const { pointOfInterests } = useNearbyPOIs(userLocation);

  console.log({ pointOfInterests });

  const navigateToPOI = (poi) => {
    console.log({ poi });
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
        </MapContainer>
      )}
    </>
  );
};

export default UserCurrentLocation;
