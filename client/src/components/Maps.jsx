import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Importation des images des marqueurs
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

const Map = ({ latitude, longitude }) => {
  const [address, setAddress] = useState('');
  const position = [latitude, longitude];

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyA5CFCsqcYY0S9AU9w2Wv3cIw6E7ksWqAw`);
        console.log('Réponse de l\'API:', response.data); // Ajout du log pour la réponse de l'API
        const address = response.data.results[0]?.formatted_address || 'Adresse non trouvée';
        setAddress(address);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'adresse:', error);
        setAddress('Erreur lors de la récupération de l\'adresse');
      }
    };

    fetchAddress();
  }, [latitude, longitude]);

  return (
    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
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
    </MapContainer>
  );
};

export default Map;