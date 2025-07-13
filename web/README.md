# Nowe Horyzonty 2025 - Interactive Movie Map

A stunning interactive visualization of the Nowe Horyzonty 2025 film festival movies plotted on a 2D map using UMAP coordinates.

## Features

- **Interactive 2D Map**: Movies are plotted as circles using UMAP coordinates
- **Color-coded Sections**: Each festival section has its own unique color
- **Section Filtering**: Filter movies by specific sections
- **Hover Details**: Show movie title, director, and section on hover
- **Detailed Side Panel**: Click on any movie to see full details including description, screenings, and metadata
- **Zoom and Pan**: Navigate the map with mouse wheel zoom and drag
- **Responsive Design**: Works on desktop and mobile devices
- **Beautiful Dark Theme**: Modern UI with smooth animations

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

## Deploying to GitHub Pages

1. Push your code to a GitHub repository
2. Go to your repository settings
3. Navigate to "Pages" in the left sidebar
4. Select "Deploy from a branch"
5. Choose "main" branch and "/web" folder
6. Click "Save"
7. Your visualization will be available at `https://yourusername.github.io/repository-name/`

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

## Customization

### Adding New Sections

To add support for new festival sections, update the `sectionColors` object in `script.js`:

```javascript
const sectionColors = {
    'Your New Section': '#your-color-hex',
    // ... existing sections
};
```

### Changing Colors

Modify the CSS variables in `styles.css` to change the theme:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    --background-color: #0f0f23;
    /* ... other variables */
}
```

### Adjusting Visualization

You can modify the D3.js visualization parameters in `script.js`:

- Circle radius: Change the `attr('r', 6)` value
- Animation duration: Modify `.duration(500)` values
- Zoom extent: Adjust `.scaleExtent([0.5, 5])`

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Nowe Horyzonty Film Festival for the movie data
- D3.js community for the excellent visualization library
- UMAP algorithm for the dimensional reduction coordinates 