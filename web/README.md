# Nowe Horyzonty 2025 - Interactive Movie Map

An interactive visualization of the Nowe Horyzonty 2025 film festival movies plotted on a 2D map using UMAP coordinates.

## Features

- **Interactive 2D Map**: Movies are plotted as circles using UMAP coordinates
- **Color-coded Sections**: Each festival section has its own unique color
- **Section Filtering**: Filter movies by specific sections
- **Hover Details**: Show movie title, director, and section on hover
- **Detailed Side Panel**: Click on any movie to see full details including description, screenings, and metadata
- **Zoom and Pan**: Navigate the map with mouse wheel zoom and drag
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **D3.js v7**: For data visualization and DOM manipulation
- **HTML5 & CSS3**: Modern web standards
- **JavaScript ES6+**: Interactive functionality
- **Inter Font**: Beautiful typography

## Running Locally

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nh-2025-movie-map
   ```

2. Navigate to the web directory:
   ```bash
   cd web
   ```

3. Start a local server (required for loading JSON data):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server
   
   # Or using PHP
   php -S localhost:8000
   ```

4. Open your browser and go to `http://localhost:8000`

## Data Structure

The visualization uses movie data with the following structure:

```json
{
  "title": "Movie Title",
  "director": "Director Name",
  "section": "Festival Section",
  "description": "Movie description...",
  "country_year_duration": "Country Year / Duration",
  "subtitles": "Subtitle information",
  "screenings": [
    {
      "date": "Date",
      "time": "Time",
      "venue": "Venue",
      "full_datetime": "Full datetime string"
    }
  ],
  "url": "program/url",
  "x": -5.22,  // UMAP x coordinate
  "y": -0.56   // UMAP y coordinate
}
```

## License

This project is open source and available under the [MIT License](LICENSE).
