# FishGaps Map

An interactive visualization tool for analyzing data gaps across aquatic food systems using the FishBase database. The tool focuses on data coverage across different categories for countries worldwide.

## Features

- Interactive globe visualization with country data
- Dark/Light mode support
- Data analysis panel with:
  - Category selection
  - Country-specific analysis
  - Comparative visualizations
  - Similar countries identification
- Responsive design for mobile and desktop

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- A Mapbox account and access token

## Environment Variables

Create a `.env` file in the root directory with:

```
REACT_APP_MAPBOX_TOKEN=your_mapbox_token_here
```

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm start
   ```

The app will be available at `http://localhost:3000`

## Deployment

### Vercel Deployment

1. Fork or clone this repository
2. Connect your GitHub repository to Vercel
3. Add the environment variable in Vercel:
   - Name: `REACT_APP_MAPBOX_TOKEN`
   - Value: Your Mapbox access token
4. Deploy!

## Data Structure

The visualization uses a JSON data structure where each country has coverage percentages across different categories:

- Conservation
- Distribution
- Human uses
- Human-related
- Population dynamics
- Reproduction
- Species
- Trophic ecology

## License

MIT
