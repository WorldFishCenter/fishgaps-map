import React, { useState, useMemo } from 'react';
import ReactApexChart from 'react-apexcharts';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';

interface CountryData {
  country: string;
  data: {
    [key: string]: number;
  };
}

interface CountryAnalysisProps {
  data: CountryData[];
  selectedCategory: string;
  isDark: boolean;
  onCategoryChange: (category: string) => void;
  categories: string[];
  selectedCountry: string | null;
  onCountrySelect: (country: string | null) => void;
}

const CountryAnalysis: React.FC<CountryAnalysisProps> = ({
  data,
  selectedCategory,
  isDark,
  onCategoryChange,
  categories,
  selectedCountry,
  onCountrySelect
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const columnHelper = createColumnHelper<CountryData>();

  // Get selected country data
  const selectedCountryData = useMemo(() => {
    if (!selectedCountry) return null;
    return data.find(c => c.country === selectedCountry);
  }, [data, selectedCountry]);

  // Calculate category averages
  const categoryAverages = useMemo(() => {
    const averages: { [key: string]: number } = {};
    categories.forEach(category => {
      const values = data.map(country => country.data[category]);
      const average = values.reduce((a, b) => a + b, 0) / values.length;
      averages[category] = average;
    });
    return averages;
  }, [data, categories]);

  // Get similar countries (countries with similar coverage in selected category)
  const similarCountries = useMemo(() => {
    if (!selectedCountryData) return [];
    const selectedValue = selectedCountryData.data[selectedCategory];
    return data
      .filter(c => c.country !== selectedCountry)
      .map(c => ({
        ...c,
        difference: Math.abs(c.data[selectedCategory] - selectedValue)
      }))
      .sort((a, b) => a.difference - b.difference)
      .slice(0, 5);
  }, [data, selectedCountry, selectedCategory, selectedCountryData]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('country', {
        header: 'Country',
        cell: info => info.getValue(),
      }),
      columnHelper.accessor(row => row.data[selectedCategory], {
        id: 'value',
        header: 'Coverage (%)',
        cell: info => info.getValue().toFixed(1),
      }),
    ],
    [selectedCategory]
  );

  const table = useReactTable({
    data: data.sort((a, b) => b.data[selectedCategory] - a.data[selectedCategory]),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const categoryProfileOptions = {
    chart: {
      type: 'radar' as const,
      toolbar: { show: false },
      background: 'transparent',
      foreColor: isDark ? '#fff' : '#2c3e50'
    },
    colors: ['#3498db', '#e74c3c'],
    stroke: {
      width: 2,
      colors: isDark ? undefined : ['#3498db', '#e74c3c']
    },
    fill: {
      opacity: 0.25,
      colors: isDark ? undefined : ['#3498db', '#e74c3c']
    },
    markers: {
      size: 4,
      colors: isDark ? undefined : ['#3498db', '#e74c3c'],
      strokeColors: isDark ? undefined : ['#3498db', '#e74c3c']
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: {
        formatter: (value: number) => `${value.toFixed(1)}%`
      }
    },
    xaxis: {
      categories: categories.map(cat => 
        cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' ')
      ),
      labels: {
        style: { 
          colors: Array(categories.length).fill(isDark ? '#fff' : '#2c3e50'),
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      show: false,
      min: 0,
      max: 100
    },
    grid: {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      row: {
        colors: isDark ? undefined : ['transparent']
      }
    },
    legend: {
      labels: {
        colors: isDark ? '#fff' : '#2c3e50'
      }
    }
  };

  const coverageDistributionOptions = {
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
      background: 'transparent',
      foreColor: isDark ? '#fff' : '#2c3e50'
    },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '60%',
        colors: {
          ranges: [{
            from: 0,
            to: 100,
            color: isDark ? '#3498db' : '#2980b9'
          }]
        }
      }
    },
    colors: ['#3498db'],
    dataLabels: { enabled: false },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      y: {
        formatter: (value: number) => `${value} countries`
      }
    },
    xaxis: {
      categories: ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'],
      labels: {
        style: { 
          colors: isDark ? '#fff' : '#2c3e50',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Number of Countries',
        style: { 
          color: isDark ? '#fff' : '#2c3e50',
          fontSize: '12px',
          fontWeight: 500
        }
      },
      labels: {
        style: { 
          colors: isDark ? '#fff' : '#2c3e50',
          fontSize: '12px'
        }
      }
    },
    grid: {
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      row: {
        colors: isDark ? undefined : ['transparent']
      }
    }
  };

  // Calculate distribution data
  const getDistributionData = () => {
    const ranges = [0, 20, 40, 60, 80, 100];
    const distribution = Array(5).fill(0);
    
    data.forEach(country => {
      const value = country.data[selectedCategory];
      for (let i = 0; i < ranges.length - 1; i++) {
        if (value >= ranges[i] && value < ranges[i + 1]) {
          distribution[i]++;
          break;
        }
      }
      if (value === 100) distribution[4]++;
    });
    
    return distribution;
  };

  return (
    <div className={`analysis-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="header-content">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 20V10M12 20V4M6 20v-6"/>
          </svg>
          <span>Data Analysis</span>
        </div>
        <div className={`panel-toggle ${isExpanded ? 'open' : ''}`}>▼</div>
      </div>

      {isExpanded && (
        <div className="panel-content">
          <div className="panel-section">
            <label>Data Category</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => onCategoryChange(e.target.value)}
              className="category-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {selectedCountryData ? (
            <>
              <div className="panel-section">
                <div className="selected-country-header">
                  <h3>{selectedCountryData.country}</h3>
                  <button className="clear-selection" onClick={() => onCountrySelect(null)}>
                    ✕
                  </button>
                </div>
                <div className="country-stats">
                  <div className="stat-item">
                    <span className="stat-label">Current Category</span>
                    <span className="stat-value">{selectedCountryData.data[selectedCategory].toFixed(1)}%</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Average Across Categories</span>
                    <span className="stat-value">
                      {(Object.values(selectedCountryData.data).reduce((a, b) => a + b, 0) / 
                        Object.values(selectedCountryData.data).length).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <ReactApexChart
                  options={categoryProfileOptions}
                  series={[
                    {
                      name: selectedCountryData.country,
                      data: categories.map(cat => selectedCountryData.data[cat])
                    },
                    {
                      name: 'Global Average',
                      data: categories.map(cat => categoryAverages[cat])
                    }
                  ]}
                  type="radar"
                  height={300}
                />
              </div>

              <div className="panel-section">
                <h3>Similar Countries</h3>
                <div className="country-list">
                  {similarCountries.map((country) => (
                    <div 
                      key={country.country} 
                      className="country-item clickable"
                      onClick={() => onCountrySelect(country.country)}
                    >
                      <span className="country-name">{country.country}</span>
                      <span className="country-value">{country.data[selectedCategory].toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="panel-section">
                <h3>Coverage Distribution</h3>
                <ReactApexChart
                  options={coverageDistributionOptions}
                  series={[{
                    name: 'Countries',
                    data: getDistributionData()
                  }]}
                  type="bar"
                  height={200}
                />
              </div>

              <div className="panel-section">
                <h3>Rankings</h3>
                <div className="table-container">
                  <table>
                    <thead>
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th key={header.id}>
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.slice(0, 10).map(row => (
                        <tr 
                          key={row.id}
                          className="clickable"
                          onClick={() => onCountrySelect(row.original.country)}
                        >
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CountryAnalysis; 