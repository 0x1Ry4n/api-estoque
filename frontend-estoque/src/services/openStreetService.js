export const OpenStreetService = {
    getCoordsByLocation: async (location) => 
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`), 
}