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

interface CategoryRange {
  min: number;
  max: number;
  label: string;
}

interface CategoryInfo {
  description: string;
  ranges: CategoryRange[];
}

interface CategoryInfoMap {
  [key: string]: CategoryInfo;
}

const CATEGORY_INFO: CategoryInfoMap = {
  'conservation': {
    description: 'Conservation status and protection measures for fish species',
    ranges: [
      { min: 0, max: 20, label: 'Critical Data Gaps' },
      { min: 20, max: 40, label: 'Limited Protection Data' },
      { min: 40, max: 60, label: 'Basic Conservation Info' },
      { min: 60, max: 80, label: 'Well Documented' },
      { min: 80, max: 100, label: 'Comprehensive Coverage' }
    ]
  },
  'distribution': {
    description: 'Geographic range and habitat information for species',
    ranges: [
      { min: 0, max: 20, label: 'Unknown Distributions' },
      { min: 20, max: 40, label: 'Partial Range Data' },
      { min: 40, max: 60, label: 'Known Key Habitats' },
      { min: 60, max: 80, label: 'Detailed Mapping' },
      { min: 80, max: 100, label: 'Full Range Mapped' }
    ]
  },
  'human uses': {
    description: 'Commercial and cultural importance of fish species',
    ranges: [
      { min: 0, max: 20, label: 'Usage Unknown' },
      { min: 20, max: 40, label: 'Basic Use Data' },
      { min: 40, max: 60, label: 'Main Uses Documented' },
      { min: 60, max: 80, label: 'Well Studied Uses' },
      { min: 80, max: 100, label: 'Complete Usage Data' }
    ]
  },
  'human-related': {
    description: 'Socioeconomic value and cultural significance',
    ranges: [
      { min: 0, max: 20, label: 'No Impact Data' },
      { min: 20, max: 40, label: 'Basic Impact Info' },
      { min: 40, max: 60, label: 'Known Importance' },
      { min: 60, max: 80, label: 'Well Documented Value' },
      { min: 80, max: 100, label: 'Full Impact Assessment' }
    ]
  },
  'population dynamics': {
    description: 'Population health, growth rates, and mortality',
    ranges: [
      { min: 0, max: 20, label: 'No Population Data' },
      { min: 20, max: 40, label: 'Basic Population Stats' },
      { min: 40, max: 60, label: 'Growth Patterns Known' },
      { min: 60, max: 80, label: 'Detailed Demographics' },
      { min: 80, max: 100, label: 'Full Population Model' }
    ]
  },
  'reproduction': {
    description: 'Breeding patterns and reproductive biology',
    ranges: [
      { min: 0, max: 20, label: 'Unknown Breeding' },
      { min: 20, max: 40, label: 'Basic Breeding Info' },
      { min: 40, max: 60, label: 'Known Life Cycles' },
      { min: 60, max: 80, label: 'Detailed Breeding Data' },
      { min: 80, max: 100, label: 'Complete Life History' }
    ]
  },
  'species': {
    description: 'Taxonomic and morphological information',
    ranges: [
      { min: 0, max: 20, label: 'Minimal Species Data' },
      { min: 20, max: 40, label: 'Basic Description' },
      { min: 40, max: 60, label: 'Standard Documentation' },
      { min: 60, max: 80, label: 'Detailed Description' },
      { min: 80, max: 100, label: 'Full Documentation' }
    ]
  },
  'trophic ecology': {
    description: 'Feeding relationships and food web position',
    ranges: [
      { min: 0, max: 20, label: 'Diet Unknown' },
      { min: 20, max: 40, label: 'Basic Diet Info' },
      { min: 40, max: 60, label: 'Known Food Web' },
      { min: 60, max: 80, label: 'Detailed Food Web' },
      { min: 80, max: 100, label: 'Complete Food Web' }
    ]
  }
};

interface WorldMapProps {
  isDark: boolean;
}

interface Range {
  min: number;
  max: number;
  color: string;
}

const COLORS = ['#edf8b1', '#7fcdbb', '#2c7fb8', '#253494', '#081d58'];

const calculateRanges = (categoryData: { [country: string]: number }): Range[] => {
  // Fixed ranges with 20% intervals
  return [
    { min: 0, max: 20, color: COLORS[0] },
    { min: 20, max: 40, color: COLORS[1] },
    { min: 40, max: 60, color: COLORS[2] },
    { min: 60, max: 80, color: COLORS[3] },
    { min: 80, max: 100, color: COLORS[4] }
  ];
};

const WorldMap: React.FC<WorldMapProps> = ({ isDark }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const popup = useRef<mapboxgl.Popup | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [activeRanges, setActiveRanges] = useState<number[]>([0, 1, 2, 3, 4]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [ranges, setRanges] = useState<Range[]>([]);
  const [showHint, setShowHint] = useState(() => {
    return localStorage.getItem('mapHintClosed') !== 'true';
  });

  const handleCloseHint = () => {
    setShowHint(false);
    localStorage.setItem('mapHintClosed', 'true');
  };

  // Update ranges when category changes
  useEffect(() => {
    const categoryData = dataByCategory[selectedCategory];
    const newRanges = calculateRanges(categoryData);
    setRanges(newRanges);
  }, [selectedCategory]);

  // Update getCountryData to include range calculation
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
  }, [selectedCategory]);

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
              'step',
              ['get', ['get', 'name_en'], ['literal', countryData]],
              COLORS[0],
              20, COLORS[1],
              40, COLORS[2],
              60, COLORS[3],
              80, COLORS[4]
            ],
            isDark ? '#2d2d2d' : '#d9d9d9' // Color for countries with no data
          ],
          'fill-opacity': [
            'case',
            ['has', ['get', 'name_en'], ['literal', countryData]],
            [
              'match',
              ['floor', ['/', ['get', ['get', 'name_en'], ['literal', countryData]], 20]],
              activeRanges,
              0.8,
              0.2
            ],
            0.2
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

            // Get the range label based on the value
            const rangeIndex = Math.floor(value / 20);
            const rangeLabel = CATEGORY_INFO[selectedCategory]?.ranges[rangeIndex]?.label || '';

            popup.current = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              className: isDark ? 'dark-popup' : 'light-popup'
            })
              .setLngLat(e.lngLat)
              .setHTML(`
                <div class="popup-content">
                  <strong>${properties.name_en}</strong>
                  <div class="popup-category">
                    <span class="popup-label">${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</span>
                    <span class="popup-value">${value.toFixed(1)}%</span>
                  </div>
                  <div class="popup-quality">
                    <span class="quality-label">${CATEGORY_INFO[selectedCategory]?.ranges[Math.floor(value / 20)]?.label}</span>
                    <small class="quality-desc">${CATEGORY_INFO[selectedCategory]?.description}</small>
                  </div>
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
  }, [isDark, selectedCategory, activeRanges]); // Removed selectedCountry from dependencies

  // Add separate effect for highlighting selected country
  useEffect(() => {
    const currentMap = map.current;
    if (!currentMap) return;

    // Update the layer paint properties for the selected country
    if (currentMap.getLayer('countries-fill')) {
      currentMap.setPaintProperty('countries-fill', 'fill-outline-color', [
        'case',
        ['==', ['get', 'name_en'], selectedCountry],
        '#3498db',
        'rgba(255, 255, 255, 0.1)'
      ]);
    }
  }, [selectedCountry]);

  return (
    <div className="map-container">
      {showHint && (
        <div className="map-hint">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          Click on any country to view detailed data coverage analysis
          <button className="hint-close" onClick={handleCloseHint} aria-label="Close hint">
            ✕
          </button>
        </div>
      )}
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
        <div className="legend-description">
          {CATEGORY_INFO[selectedCategory]?.description}
        </div>
        <div className="legend-scale">
          {ranges.map((range: Range, index: number) => (
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
              <div className="legend-label-content">
                <span>{range.min.toFixed(1)}-{range.max.toFixed(1)}%</span>
                <small>{CATEGORY_INFO[selectedCategory]?.ranges[index]?.label}</small>
              </div>
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