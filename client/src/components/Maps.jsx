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

const Map = ({ latitude, longitude, destination, batteryLevel }) => {
  const [address, setAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [distance, setDistance] = useState(null);
  const [energyConsumption, setEnergyConsumption] = useState(null);
  const [newBatterylevel, setBatteryLevel] = useState(null);  
  const [remainingAutonomy, setRemainingAutonomy] = useState(null); 
  
  const position = [latitude, longitude];
  const [route, setRoute] = useState([]);

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

          // Récupération de l'adresse de la destination
          const destinationResponse = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${destination.latitude}&lon=${destination.longitude}`);
          const destinationAddress = destinationResponse.data.display_name || 'Adresse non trouvée';
          setDestinationAddress(destinationAddress);

          // Récupération de la distance
          const distance = response.data.routes[0].distance; // En mètres
          setDistance(distance);

          // Calcule de la consommation d'énergie
          const consumptionPer100Km = 15.4; // Consommation en kWh/100 km
          const energyConsumption = (distance / 1000) * (consumptionPer100Km / 100);
          console.log(`l'energie consommé ${energyConsumption}`);

          // Calcule de la batterie restante
          const remainingBattery = batteryLevel * 50;  // Batterie restante en kWh (50 kWh par exemple)
          console.log(`la batterie restante ${remainingBattery} kWh`); 

          // Batterie restante après le trajet
          const remainingBatteryAfterTheRide = remainingBattery - energyConsumption;
          console.log(`la batterie restante après le trajet ${remainingBatteryAfterTheRide} kWh`);

          // Calcule du pourcentage de batterie restante
          const newBatterylevel = (remainingBatteryAfterTheRide / 50) * 100;
          console.log(`pourcentage batterie a l'arrivé ${newBatterylevel.toFixed(0)}`);

          // Mettre à jour l'état pour le pourcentage de batterie
          setBatteryLevel(newBatterylevel);
          // Metttre a jour la consommation d'energie
          setEnergyConsumption(energyConsumption); 

          // calcule de l'autonomie restante en Km
          const remainingAutonomy = (newBatterylevel / 100) * 400;
          console.log(`L'autonomie restante a l'arrivée de destination ${remainingAutonomy} km`);
          // Mettre à jour l'état pour l'autonomie restante en km
          setRemainingAutonomy(remainingAutonomy);
        } catch (error) {
          console.error('Erreur lors de la récupération du trajet ou de l\'adresse de la destination:', error);
        }
      };

      fetchRoute();
    } else {
      setRoute([]); // Réinitialiser la route si la destination est null
      setDestinationAddress(''); // Réinitialiser l'adresse de la destination
      setDistance(null); // Réinitialiser la distance
      setEnergyConsumption(null); // Réinitialiser la consommation d'énergie
    }
  }, [destination, latitude, longitude, batteryLevel]);

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
          <>
            <p>Distance: {(distance / 1000).toFixed(2)} km</p>
            <p>Consommation d'énergie: {energyConsumption?.toFixed(2)} kWh</p>
            <p>Pourcentage de batterie restant: {newBatterylevel ? newBatterylevel.toFixed(0) +'%': 'Calcul en cours...'}</p>
            <p>Autonomie restante: {remainingAutonomy.toFixed(0)} km</p>
          </>
        ) : (
          <p>Aucune destination définie</p>
        )}
      </div>
    </div>
  );
};

export default Map;
