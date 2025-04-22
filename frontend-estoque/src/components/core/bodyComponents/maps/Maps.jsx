import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, FeatureGroup, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { Button, Box, TextField, AppBar, Toolbar, Typography, Container, Grid, Tooltip, Avatar, Chip, Divider, CircularProgress, Alert } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import api from '../../../../api';

const MapComponent = () => {
  const [markers, setMarkers] = useState([]);
  const [filter, setFilter] = useState('');
  const [polygons, setPolygons] = useState([]);
  const [lines, setLines] = useState([]);
  const [showPolygons, setShowPolygons] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [selectedMarkers, setSelectedMarkers] = useState([]);
  const [distanceLine, setDistanceLine] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [geocodingProgress, setGeocodingProgress] = useState(0);
  const [geocodingError, setGeocodingError] = useState(null);

  useEffect(() => {
    const savedMarkers = JSON.parse(localStorage.getItem('markers')) || [];
    const savedPolygons = JSON.parse(localStorage.getItem('polygons')) || [];
    const savedLines = JSON.parse(localStorage.getItem('lines')) || [];
    setMarkers(savedMarkers);
    setPolygons(savedPolygons);
    setLines(savedLines);

    const loadSuppliers = async () => {
      try {
        setLoadingSuppliers(true);
        const response = await api.get("/supplier");
        const suppliersData = response.data?.content || [];
        
        const suppliersWithCoords = await geocodeSuppliers(suppliersData);
        
        setSuppliers(suppliersWithCoords);
      } catch (error) {
        console.error("Erro ao carregar fornecedores:", error);
        setGeocodingError("Erro ao carregar fornecedores. Tente novamente mais tarde.");
      } finally {
        setLoadingSuppliers(false);
      }
    };

    loadSuppliers();
  }, []);

  useEffect(() => {
    localStorage.setItem('markers', JSON.stringify(markers));
    localStorage.setItem('polygons', JSON.stringify(polygons));
    localStorage.setItem('lines', JSON.stringify(lines));
  }, [markers, polygons, lines]);

  const geocodeCEP = async (cep) => {
    try {
      const cleanCEP = cep.replace(/\D/g, '');
      
      if (cleanCEP.length !== 8) {
        throw new Error('CEP inválido');
      }

      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();

      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      const address = `${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}`;
      const nominatimResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const nominatimData = await nominatimResponse.json();

      if (nominatimData.length > 0) {
        return {
          latitude: parseFloat(nominatimData[0].lat),
          longitude: parseFloat(nominatimData[0].lon),
          address: address
        };
      } else {
        const cityResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.localidade + ', ' + data.uf)}`
        );
        const cityData = await cityResponse.json();
        
        if (cityData.length > 0) {
          return {
            latitude: parseFloat(cityData[0].lat),
            longitude: parseFloat(cityData[0].lon),
            address: data.localidade + ', ' + data.uf
          };
        }
      }

      throw new Error('Coordenadas não encontradas para este CEP');
    } catch (error) {
      console.error(`Erro ao geocodificar CEP ${cep}:`, error);
      return null;
    }
  };

  const geocodeSuppliers = async (suppliers) => {
    setGeocodingProgress(0);
    setGeocodingError(null);
    
    const results = [];
    let processed = 0;
    
    for (const supplier of suppliers) {
      try {
        if (supplier.zipCode) {
          const coords = await geocodeCEP(supplier.zipCode);
          
          if (coords) {
            results.push({
              ...supplier,
              latitude: coords.latitude,
              longitude: coords.longitude,
              fullAddress: coords.address
            });
          } else {
            results.push({
              ...supplier,
              latitude: null,
              longitude: null,
              fullAddress: null
            });
          }
        } else {
          results.push({
            ...supplier,
            latitude: null,
            longitude: null,
            fullAddress: null
          });
        }
      } catch (error) {
        console.error(`Erro ao processar fornecedor ${supplier.id}:`, error);
        results.push({
          ...supplier,
          latitude: null,
          longitude: null,
          fullAddress: null
        });
      }
      
      processed++;
      setGeocodingProgress(Math.round((processed / suppliers.length) * 100));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  };

  const addMarker = (e) => {
    const { lat, lng } = e.latlng;
    setMarkers((prevMarkers) => [...prevMarkers, { lat, lng, note: '' }]);
  };

  const handleNoteChange = (index, value) => {
    const updatedMarkers = [...markers];
    updatedMarkers[index].note = value;
    setMarkers(updatedMarkers);
  };

  const deleteMarker = (index) => {
    const updatedMarkers = markers.filter((_, i) => i !== index);
    setMarkers(updatedMarkers);
    setDistanceLine(null);
  };

  const clearMarkers = () => {
    setMarkers([]);
    setDistanceLine(null);
  };

  const handlePolygonCreate = (e) => {
    const { layer } = e;
    const newPolygon = layer.getLatLngs();
    setPolygons((prevPolygons) => [...prevPolygons, newPolygon]);
  };

  const handleLineCreate = (e) => {
    const { layer } = e;
    const newLine = layer.getLatLngs();
    setLines((prevLines) => [...prevLines, newLine]);
  };

  const searchLocation = async () => {
    const location = prompt('Digite o endereço:');
    if (!location) return;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setMarkers((prevMarkers) => [...prevMarkers, { lat: parseFloat(lat), lng: parseFloat(lon), note: '' }]);
      } else {
        alert('Localização não encontrada.');
      }
    } catch (error) {
      console.error('Erro ao buscar localização:', error);
      alert('Erro ao buscar localização. Tente novamente.');
    }
  };

  const restoreDefaultMarkers = () => {
    const defaultMarkers = [
      { lat: -23.5505, lng: -46.6333, note: 'São Paulo' },
      { lat: -22.9068, lng: -43.1729, note: 'Rio de Janeiro' },
      { lat: -19.9167, lng: -43.9345, note: 'Belo Horizonte' }
    ];
    setMarkers(defaultMarkers);
  };

  const calculateDistance = () => {
    if (selectedMarkers.length === 2) {
      const [marker1, marker2] = selectedMarkers;
      const latLng1 = L.latLng(marker1.lat, marker1.lng);
      const latLng2 = L.latLng(marker2.lat, marker2.lng);
      const distance = latLng1.distanceTo(latLng2) / 1000;
      alert(`A distância entre os dois marcadores é de ${distance.toFixed(2)} km.`);

      setDistanceLine([marker1, marker2]);
      setSelectedMarkers([]);
    }
  };

  const handleMarkerClick = (marker) => {
    setSelectedMarkers((prev) => {
      if (prev.includes(marker)) {
        return prev.filter(m => m !== marker);
      } else {
        if (prev.length < 2) {
          return [...prev, marker];
        }
        return prev;
      }
    });
  };

  const handleExport = () => {
    const sessionData = {
      markers,
      polygons,
      lines,
    };
    const blob = new Blob([JSON.stringify(sessionData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'session.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = JSON.parse(event.target.result);
      setMarkers(data.markers || []);
      setPolygons(data.polygons || []);
      setLines(data.lines || []);
    };
    reader.readAsText(file);
  };

  const MapZoomToShapes = () => {
    const map = useMap();
    useEffect(() => {
      if (polygons.length > 0 || lines.length > 0) {
        const group = new L.featureGroup([
          ...polygons.map((polygon) => L.polygon(polygon)),
          ...lines.map((line) => L.polyline(line)),
        ]);
        map.fitBounds(group.getBounds());
      }
    }, [polygons, lines, map]);
    return null;
  };

  const renderSupplierPopup = (supplier) => {
    return (
      <Box sx={{ minWidth: 250 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar 
            src={supplier.logo || 'https://cdn-icons-png.flaticon.com/512/2909/2909526.png'} 
            sx={{ width: 56, height: 56, mr: 2 }}
          />
          <Box>
            <Typography variant="h6" fontWeight="bold">{supplier.name}</Typography>
            <Typography variant="body2" color="text.secondary">{supplier.category}</Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2"><strong>Endereço:</strong> {supplier.fullAddress || supplier.address}</Typography>
          {supplier.zipCode && <Typography variant="body2"><strong>CEP:</strong> {supplier.zipCode}</Typography>}
        </Box>
        
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2"><strong>Contato:</strong> {supplier.contactName || 'Não informado'}</Typography>
          <Typography variant="body2"><strong>Telefone:</strong> {supplier.phone || 'Não informado'}</Typography>
          {supplier.email && <Typography variant="body2"><strong>Email:</strong> {supplier.email}</Typography>}
        </Box>
        
        {supplier.products && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2">Produtos/Serviços:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {supplier.products.split(',').map((product, i) => (
                <Chip key={i} label={product.trim()} size="small" />
              ))}
            </Box>
          </Box>
        )}
        
        <Button 
          variant="outlined" 
          fullWidth 
          sx={{ mt: 2 }}
          onClick={() => window.location.href = `/suppliers/${supplier.id}`}
        >
          Ver Detalhes
        </Button>
      </Box>
    );
  };

  return (
    <Container sx={{ mt: 3, height: '800px', width: '100%' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Mapa de Fornecedores e Marcadores</Typography>
        </Toolbar>
      </AppBar>

      {loadingSuppliers && (
        <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
          <CircularProgress variant="determinate" value={geocodingProgress} sx={{ mr: 2 }} />
          <Typography>
            Carregando fornecedores... {geocodingProgress}% completo
          </Typography>
        </Box>
      )}

      {geocodingError && (
        <Alert severity="error" sx={{ my: 2 }}>
          {geocodingError}
        </Alert>
      )}

      <Box sx={{ my: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Filtrar Notas"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Tooltip title="Buscar Localização">
              <Button variant="contained" fullWidth onClick={searchLocation}>
                Buscar Localização
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ my: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Tooltip title={showPolygons ? "Esconder Polígonos" : "Mostrar Polígonos"}>
              <Button variant="outlined" fullWidth onClick={() => setShowPolygons(!showPolygons)}>
                {showPolygons ? 'Esconder Polígonos' : 'Mostrar Polígonos'}
              </Button>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Tooltip title={showLines ? "Esconder Linhas" : "Mostrar Linhas"}>
              <Button variant="outlined" fullWidth onClick={() => setShowLines(!showLines)}>
                {showLines ? 'Esconder Linhas' : 'Mostrar Linhas'}
              </Button>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Tooltip title="Limpar Marcadores">
              <Button variant="outlined" color="warning" fullWidth onClick={clearMarkers}>
                Limpar Marcadores
              </Button>
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Tooltip title="Restaurar Marcadores Padrão">
              <Button variant="outlined" color="secondary" fullWidth onClick={restoreDefaultMarkers}>
                Restaurar Marcadores Padrão
              </Button>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      <MapContainer center={[-23.5505, -46.6333]} zoom={13} onClick={addMarker} style={{ height: '600px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handlePolygonCreate}
            draw={{
              rectangle: false,
              circle: false,
              polyline: {
                allowIntersection: false,
                shapeOptions: {
                  color: '#f357a1',
                  weight: 10,
                },
              },
              marker: false,
              polygon: {
                allowIntersection: false,
              },
            }}
          />
        </FeatureGroup>

        {suppliers.map((supplier, index) => {
          if (!supplier.latitude || !supplier.longitude) return null;
          
          return (
            <Marker
              key={`supplier-${index}`}
              position={[supplier.latitude, supplier.longitude]}
              icon={supplierIcon}
            >
              <Popup>{renderSupplierPopup(supplier)}</Popup>
            </Marker>
          );
        })}

        {markers.filter(marker => marker.note.includes(filter)).map((marker, index) => (
          <Marker
            key={`marker-${index}`}
            position={[marker.lat, marker.lng]}
            eventHandlers={{
              click: () => handleMarkerClick(marker),
            }}
          >
            <Popup>
              <TextField
                label="Nota"
                value={marker.note}
                onChange={(e) => handleNoteChange(index, e.target.value)}
                variant="outlined"
                fullWidth
              />
              <Button variant="outlined" color="error" onClick={() => deleteMarker(index)}>
                Deletar Marcador
              </Button>
            </Popup>
          </Marker>
        ))}

        {showPolygons && polygons.map((polygon, index) => (
          <Polygon key={`polygon-${index}`} positions={polygon} />
        ))}

        {showLines && lines.map((line, index) => (
          <Polyline key={`line-${index}`} positions={line} />
        ))}

        {distanceLine && ( 
          <Polyline positions={distanceLine.map(marker => [marker.lat, marker.lng])} color="red" />
        )}

        <MapZoomToShapes />
      </MapContainer>
    </Container>
  );
};

export default MapComponent;