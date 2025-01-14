import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Importer des images des marqueurs
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configuration de l'icône du marqueur
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const Map = ({ latitude, longitude, destination }) => {
  const [address, setAddress] = useState('');
  const position = [latitude, longitude];
  const [route, setRoute] = useState([]);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [distance, setDistance] = useState(null);


  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const address = response.data.display_name || 'Adresse non trouvée';
        setAddress(address);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'adresse:', error);
        setAddress('Erreur lors de la récupération de l\'adresse');
      }
    };

    fetchAddress();
  }, [latitude, longitude]);

  useEffect(() => {
    if (destination) {
      const fetchRoute = async () => {
        try {
          const response = await axios.get(`https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`);
          const route = response.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRoute(route);

          const destinationResponse = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${destination.latitude}&lon=${destination.longitude}`);
          const destinationAddress = destinationResponse.data.display_name || 'Adresse non trouvée';
          setDestinationAddress(destinationAddress);

		  const distance = response.data.routes[0].distance;
		  setDistance(distance);
        } catch (error) {
          console.error('Erreur lors de la récupération du trajet:', error);
        }
      };

      fetchRoute();
    } else {
      setRoute([]); // Réinitialiser la route si la destination est null
	  setDestinationAddress(''); // réinitialisé
	  setDistance(null); // réinitialisé
    }
  }, [destination, latitude, longitude]);

  return (
    <div style={{ display: 'flex' }}>
      <MapContainer center={position} zoom={13} style={{ height: '400px', width: '70%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} icon={defaultIcon}>
          <Popup>
            Latitude: {latitude}, Longitude: {longitude}<br />
            Adresse: {address}
          </Popup>
        </Marker>
        {destination && (
          <Marker position={[destination.latitude, destination.longitude]} icon={defaultIcon}>
            <Popup>
              Destination: {destinationAddress}
            </Popup>
          </Marker>
        )}
        {route.length > 0 && (
          <Polyline positions={route} color="blue" />
        )}
      </MapContainer>
      <div style={{ marginLeft: '20px', padding: '10px', border: '1px solid #ccc', width: '30%' }}>
        <h3>Informations sur le trajet</h3>
        {distance !== null ? (
          <p>Distance: {(distance / 1000).toFixed(2)} km</p>
        ) : (
          <p>Aucune destination définie</p>
        )}
      </div>
    </div>
  );
};

export default Map;