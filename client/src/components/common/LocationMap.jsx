import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const LocationMap = ({ lat, lng, onLocationSelect }) => {
    // Default center (e.g., city center or user's current loc)
    // If no lat/lng provided, default to a generic location (e.g. New York or India center)
    // For now, let's default to a generic generic startup location (Delhi/Mumbai/NY) if empty
    // Or better, 0,0 provided we check for it. Let's use 20.5937, 78.9629 (India) as fallback
    const defaultPosition = [20.5937, 78.9629];
    const position = lat && lng ? [lat, lng] : null;
    const center = position || defaultPosition;

    return (
        <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', zIndex: 0 }}>
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false} // Disable scroll zoom to prevent page scroll blocking
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker
                    position={position}
                    setPosition={(latlng) => onLocationSelect(latlng.lat, latlng.lng)}
                />
            </MapContainer>
        </div>
    );
};

export default LocationMap;
