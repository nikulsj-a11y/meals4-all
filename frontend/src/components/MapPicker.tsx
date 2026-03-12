import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  onLocationSelect: (location: { address: string; latitude: number; longitude: number }) => void;
  initialLocation?: { address: string; latitude: number; longitude: number };
}

// Component to handle map clicks
function LocationMarker({
  onLocationSelect,
  initialPosition
}: {
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition?: [number, number] | null;
}) {
  const [position, setPosition] = useState<L.LatLng | null>(
    initialPosition ? L.latLng(initialPosition[0], initialPosition[1]) : null
  );

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  // Get current location on mount only if no initial position
  useEffect(() => {
    if (!initialPosition) {
      map.locate();
    } else {
      // If initial position exists, set it and fly to it
      const latLng = L.latLng(initialPosition[0], initialPosition[1]);
      setPosition(latLng);
      map.flyTo(latLng, 13);
    }
  }, [map, initialPosition]);

  useMapEvents({
    locationfound(e) {
      // Only update if we don't have an initial position
      if (!initialPosition) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, 13);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          setPosition(position);
          onLocationSelect(position.lat, position.lng);
        },
      }}
    />
  );
}

const MapPicker = ({ onLocationSelect, initialLocation }: MapPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<L.Map>(null);

  // Default to Delhi, India or initial location
  const defaultCenter: [number, number] = initialLocation
    ? [initialLocation.latitude, initialLocation.longitude]
    : [28.6139, 77.209];

  // Initial position for marker (null if no initial location)
  const initialPosition: [number, number] | null = initialLocation
    ? [initialLocation.latitude, initialLocation.longitude]
    : null;

  const handleLocationSelect = async (lat: number, lng: number) => {
    // Use Nominatim (OpenStreetMap) for reverse geocoding
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

      onLocationSelect({ address, latitude: lat, longitude: lng });
    } catch (error) {
      console.error('Geocoding error:', error);
      onLocationSelect({
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        latitude: lat,
        longitude: lng
      });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      // Use Nominatim for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        // Fly to location
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 13);
        }

        handleLocationSelect(lat, lng);
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Search Location
        </label>
        <form className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a location (e.g., Connaught Place, Delhi)..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-1">
          Click on the map to select location or drag the marker.
          {initialLocation ? ' Map shows the current saved location.' : ' Map will show your current location initially.'}
        </p>
      </div>
      <div className="w-full h-96 rounded-lg border border-gray-300 overflow-hidden">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            onLocationSelect={handleLocationSelect}
            initialPosition={initialPosition}
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPicker;

