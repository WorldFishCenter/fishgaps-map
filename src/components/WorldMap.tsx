import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import mapData from '../data/map_data.json';
import CountryAnalysis from './CountryAnalysis';

// Access the environment variable
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

console.log('Mapbox Token:', MAPBOX_TOKEN); // Debug log

if (!MAPBOX_TOKEN) {
  throw new Error('Mapbox token is required. Please add it to your .env file as REACT_APP_MAPBOX_TOKEN');
}

// Set the access token
try {
  mapboxgl.accessToken = MAPBOX_TOKEN;
} catch (error) {
  console.error('Error setting Mapbox access token:', error);
}

// Define feature properties type
interface CountryProperties {
  iso_3166_1_alpha_3: string;
  name_en: string;
}

// Define data types
interface CountryData {
  [category: string]: number;
}

interface MapDataItem {
  country: string;
  data: CountryData;
}

// Process the data to get unique categories and organize by category
const processMapData = (data: MapDataItem[]) => {
  // Get unique categories from the first item's data object
  const uniqueCategories = data.length > 0 ? 
    Object.keys(data[0].data).sort() : [];
  console.log('All categories found:', uniqueCategories); // Debug log
  
  // Create lookup objects for each category
  const dataByCategory: { [category: string]: { [country: string]: number } } = {};
  uniqueCategories.forEach(category => {
    dataByCategory[category] = {};
    data.forEach(item => {
      if (item.data[category] !== undefined) {
        dataByCategory[category][item.country] = item.data[category];
      }
    });
  });

  console.log('Data by category:', Object.keys(dataByCategory)); // Debug log
  return { categories: uniqueCategories, dataByCategory };
};

const { categories, dataByCategory } = processMapData(mapData as MapDataItem[]);

// Create a mapping of common country name variations
const countryNameVariations: { [key: string]: string[] } = {
  'United States': ['United States of America', 'USA', 'US', 'United States of America (the)'],
  'United Kingdom': ['UK', 'Great Britain', 'Britain', 'United Kingdom of Great Britain and Northern Ireland (the)'],
  'Russia': ['Russian Federation', 'Russian Federation (the)'],
  'Czech Republic': ['Czechia'],
  'Macedonia': ['North Macedonia', 'Republic of North Macedonia'],
  'Swaziland': ['Eswatini', 'Kingdom of Eswatini'],
  'Burma': ['Myanmar'],
  'Congo': ['Democratic Republic of the Congo', 'Republic of the Congo', 'Congo (the Democratic Republic of the)'],
  'Ivory Coast': ["Côte d'Ivoire", 'Cote dIvoire'],
  'Timor-Leste': ['East Timor'],
  'Vatican City': ['Holy See', 'Vatican'],
  'South Korea': ['Korea (the Republic of)', 'Republic of Korea', 'Korea'],
  'North Korea': ["Korea (the Democratic People's Republic of)", "Democratic People's Republic of Korea"],
  'Taiwan': ['Taiwan (Province of China)', 'Chinese Taipei'],
  'Palestine': ['Palestine, State of', 'State of Palestine'],
  'Tanzania': ['Tanzania, United Republic of', 'United Republic of Tanzania'],
  'Venezuela': ['Venezuela (Bolivarian Republic of)', 'Bolivarian Republic of Venezuela'],
  'Vietnam': ['Viet Nam'],
  'Laos': ["Lao People's Democratic Republic", 'Lao PDR'],
  'Syria': ['Syrian Arab Republic'],
  'Bolivia': ['Bolivia (Plurinational State of)'],
  'Iran': ['Iran (Islamic Republic of)'],
};

interface WorldMapProps {
  isDark: boolean;
}

const RANGES = [
  { min: 0, max: 20, color: '#edf8b1' },
  { min: 20, max: 40, color: '#7fcdbb' },
  { min: 40, max: 60, color: '#2c7fb8' },
  { min: 60, max: 80, color: '#253494' },
  { min: 80, max: 100, color: '#081d58' }
];

const WorldMap: React.FC<WorldMapProps> = ({ isDark }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [activeRanges, setActiveRanges] = useState<number[]>([0, 1, 2, 3, 4]);
  const [mapError, setMapError] = useState<string | null>(null);

  // Move getCountryData into useCallback to properly handle dependencies
  const getCountryData = React.useCallback(() => {
    const data: { [key: string]: number } = {};
    const categoryData = dataByCategory[selectedCategory];
    
    Object.entries(categoryData).forEach(([country, value]) => {
      // Store variations of the country name to improve matching
      data[country] = value;
      
      // Remove special characters and extra spaces
      const simplifiedName = country
        .replace(/\./g, '')
        .replace(/\s+/g, ' ')
        .trim();
      data[simplifiedName] = value;
      
      // Add all possible variations for this country
      Object.entries(countryNameVariations).forEach(([key, variations]) => {
        if (country.includes(key) || key.includes(country)) {
          variations.forEach(variant => {
            data[variant] = value;
          });
        }
      });
    });
    
    return data;
  }, [selectedCategory]); // Add selectedCategory as dependency

  const handleRangeToggle = (rangeIndex: number) => {
    setActiveRanges(prev => {
      if (prev.includes(rangeIndex)) {
        return prev.filter(i => i !== rangeIndex);
      } else {
        return [...prev, rangeIndex].sort((a, b) => a - b);
      }
    });
  };

  const handleCountryClick = (countryName: string) => {
    setSelectedCountry(prevCountry => 
      prevCountry === countryName ? null : countryName
    );
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // Clean up existing map
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    // Initialize new map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11',
      center: [0, 20],
      zoom: 1.8,
      minZoom: 1,
      maxZoom: 7,
      projection: { name: 'globe' }
    });

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add atmosphere effect for globe
    map.current.on('style.load', () => {
      const currentMap = map.current;
      if (!currentMap) return;
      
      currentMap.setFog({
        color: isDark ? 'rgb(26, 26, 26)' : 'rgb(245, 245, 245)',
        'high-color': isDark ? 'rgb(26, 26, 26)' : 'rgb(245, 245, 245)',
        'horizon-blend': 0.1,
        'space-color': isDark ? 'rgb(26, 26, 26)' : 'rgb(245, 245, 245)',
        'star-intensity': isDark ? 0.15 : 0
      });
    });

    // Wait for map to load before adding layers
    map.current.on('load', () => {
      const countryData = getCountryData();
      const currentMap = map.current;
      
      if (!currentMap) return;

      // Add source for country boundaries
      currentMap.addSource('countries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1'
      });

      // Add the choropleth layer
      currentMap.addLayer({
        id: 'countries-fill',
        type: 'fill',
        source: 'countries',
        'source-layer': 'country_boundaries',
        paint: {
          'fill-color': [
            'case',
            ['has', ['get', 'name_en'], ['literal', countryData]],
            [
              'interpolate',
              ['linear'],
              ['get', ['get', 'name_en'], ['literal', countryData]],
              0, isDark ? '#1a1a1a' : '#f7f7f7',
              20, '#edf8b1',
              40, '#7fcdbb',
              60, '#2c7fb8',
              80, '#253494',
              100, '#081d58'
            ],
            isDark ? '#2d2d2d' : '#d9d9d9'
          ],
          'fill-opacity': [
            'case',
            ['has', ['get', 'name_en'], ['literal', countryData]],
            [
              'match',
              ['floor', ['/', ['get', ['get', 'name_en'], ['literal', countryData]], 20]],
              activeRanges,
              0.7,
              0.15
            ],
            0.15
          ]
        }
      });

      // Add hover and click handlers
      currentMap.on('mousemove', 'countries-fill', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          const properties = feature.properties as CountryProperties;
          const value = countryData[properties.name_en];

          if (value !== undefined) {
            if (popup.current) {
              popup.current.remove();
            }
            popup.current = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              className: isDark ? 'dark-popup' : 'light-popup'
            })
              .setLngLat(e.lngLat)
              .setHTML(`
                <div class="popup-content">
                  <strong>${properties.name_en}</strong><br/>
                  ${selectedCategory}: ${value.toFixed(1)}%
                </div>
              `)
              .addTo(currentMap);
          }
        }
      });

      currentMap.on('mouseleave', 'countries-fill', () => {
        if (popup.current) {
          popup.current.remove();
          popup.current = null;
        }
      });

      currentMap.on('click', 'countries-fill', (e) => {
        if (e.features && e.features.length > 0) {
          const properties = e.features[0].properties as CountryProperties;
          if (properties) {
            const countryName = properties.name_en;
            const value = countryData[countryName];
            if (value !== undefined) {
              handleCountryClick(countryName);
            }
          }
        }
      });
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isDark, selectedCategory, activeRanges, selectedCountry]);

  return (
    <div className="map-container">
      <CountryAnalysis
        data={mapData}
        selectedCategory={selectedCategory}
        isDark={isDark}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        selectedCountry={selectedCountry}
        onCountrySelect={setSelectedCountry}
      />

      {mapError && (
        <div className="map-error">
          Error: {mapError}
        </div>
      )}

      <div className={`map-legend ${!isDark ? 'light-mode' : ''}`}>
        <div className="legend-title">Data Coverage (%)</div>
        <div className="legend-scale">
          {RANGES.map((range, index) => (
            <div
              key={index}
              className={`legend-label ${!activeRanges.includes(index) ? 'inactive' : ''}`}
              onClick={() => handleRangeToggle(index)}
            >
              <span 
                className="legend-color" 
                style={{ 
                  backgroundColor: range.color,
                  opacity: activeRanges.includes(index) ? 1 : 0.3
                }}
              />
              <span>{range.min}-{range.max}</span>
            </div>
          ))}
        </div>
      </div>
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative',
          backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5'
        }} 
      />
    </div>
  );
};

export default WorldMap; 