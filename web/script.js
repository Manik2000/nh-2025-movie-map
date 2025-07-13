// Color scheme for different sections - lighter, more elegant colors
const sectionColors = {
    'Filmy, które zostały?': '#7fb069',      // Soft green
    'Pokazy Specjalne': '#6b9bd1',          // Light blue
    'Trzecie Oko': '#8fb8c7',               // Muted blue-gray
    'Oslo / Reykjavik': '#a8c686',          // Light sage
    'Front Wizualny': '#d4a574',            // Warm beige
    'Klub Festiwalowy w Arsenale': '#c19bd1', // Soft purple
    'Międzynarodowy Konkurs Nowe Horyzonty': '#6ba3d6', // Sky blue
    'Shortlista': '#9d7fb8',                // Muted purple
    'Odkrycia': '#6db4c4',                  // Teal
    'Wydarzenia specjalne': '#d48b7a',      // Coral
    'Pokazy Galowe': '#8bb174',             // Forest green
    'Focus: Athina Rachel Tsangari': '#deb887', // Burlywood
    'Retrospektywa: Anne-Marie Miéville': '#8da5c4', // Steel blue
    'Retrospektywa: Anka Sasnal, Wilhelm Sasnal': '#d19bc4', // Rose
    'Nocne Szaleństwo': '#b8a4d1',          // Lavender
    'Lost Lost Lost': '#7eb89a',            // Mint green
    'Istoty Nocy': '#d1a4b8',               // Dusty rose
    'Fale': '#6fb3a0',                      // Seafoam
    'Mistrzynie, Mistrzowie': '#e4c57c',    // Golden sand
    'Retrospektywa: Glauber Rocha': '#a48bc4', // Amethyst
    'Młode Horyzonty': '#87c5d6',           // Light cyan
    'Sezon': '#b8a8d6',                     // Pale purple
    'Retrospektywa: Lee Chang-dong': '#d1a4b8', // Dusty rose
    'Pokazy na Rynku': '#7db8b3',           // Sage green
    'Scena Artystyczna': '#d4976b',         // Terra cotta
    'Smart 7': '#9cc5c7',                   // Powder blue
    'Pokazy w OPT Zamek w Leśnicy': '#d6b894' // Wheat
};

// Global variables
let movieData = [];
let svg, width, height;
let xScale, yScale, colorScale;
let currentFilters = []; // Array to store multiple selected sections

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Load movie data
    loadMovieData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize visualization
    initializeVisualization();
});

function loadMovieData() {
    // Load movie data from the JSON file
    fetch('./full_movie_details.json')
        .then(response => response.json())
        .then(data => {
            movieData = data;
            updateVisualization();
            updateMovieCount();
            updateLegend();
        })
        .catch(error => {
            console.error('Error loading movie data:', error);
            // Fallback: use sample data for demo
            movieData = getSampleData();
            updateVisualization();
            updateMovieCount();
            updateLegend();
        });
}

function getSampleData() {
    // Sample data for demonstration
    return [
        {"title": "Decasia", "director": "Bill Morrison", "section": "Filmy, które zostały?", "description": "Kultowy pełnometrażowy kolaż Billa Morrisona...", "country_year_duration": "N/A", "subtitles": "napisy: polskie i angielskie", "screenings": [{"date": "nd 20 lip", "time": "16:00", "venue": "knh 2"}], "x": -5.22, "y": -0.56},
        {"title": "Happy Doom", "director": "N/A", "section": "Pokazy Specjalne", "description": "Siedem spośród 14 krótkich metraży...", "country_year_duration": "N/A", "subtitles": null, "screenings": [{"date": "pn 21 lip", "time": "15:45", "venue": "knh 5"}], "x": -11.26, "y": 11.21},
        {"title": "Mamy", "director": "Ariadna Seuba Serra", "section": "Trzecie Oko", "description": "Droga Anny i Ari do macierzyństwa...", "country_year_duration": "Hiszpania 2025 / 76'", "subtitles": "napisy: polskie i angielskie", "screenings": [{"date": "pn 21 lip", "time": "13:00", "venue": "knh 3"}], "x": -7.58, "y": 5.19}
    ];
}

function setupEventListeners() {
    // Close details panel
    document.getElementById('close-details').addEventListener('click', function() {
        hideMovieDetails();
    });
    
    // Legend toggle
    document.getElementById('legend-toggle').addEventListener('click', function() {
        toggleLegend();
    });
}

function initializeVisualization() {
    const container = document.querySelector('.visualization-container');
    width = container.clientWidth;
    height = container.clientHeight || 600;
    
    svg = d3.select('#movie-map')
        .attr('width', width)
        .attr('height', height);
    
    // Create scales
    updateScales();
    
    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.5, 5])
        .on('zoom', handleZoom);
    
    svg.call(zoom);
    
    // Create main group for zoomable content
    svg.append('g').attr('class', 'main-group');
    
    // Create legend
    createLegend();
}

function updateScales() {
    if (movieData.length === 0) return;
    
    const xExtent = d3.extent(movieData, d => d.x);
    const yExtent = d3.extent(movieData, d => d.y);
    
    // Add padding to the extents
    const xPadding = (xExtent[1] - xExtent[0]) * 0.1;
    const yPadding = (yExtent[1] - yExtent[0]) * 0.1;
    
    xScale = d3.scaleLinear()
        .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
        .range([50, width - 50]);
    
    yScale = d3.scaleLinear()
        .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
        .range([height - 50, 50]);
}

function addGridLines(container) {
    // Remove existing grid lines
    container.selectAll('.grid-line').remove();
    
    // Create vertical grid lines
    const xTicks = xScale.ticks(8);
    container.selectAll('.grid-line-x')
        .data(xTicks)
        .enter()
        .append('line')
        .attr('class', 'grid-line grid-line-x')
        .attr('x1', d => xScale(d))
        .attr('x2', d => xScale(d))
        .attr('y1', 50)
        .attr('y2', height - 50);
    
    // Create horizontal grid lines
    const yTicks = yScale.ticks(6);
    container.selectAll('.grid-line-y')
        .data(yTicks)
        .enter()
        .append('line')
        .attr('class', 'grid-line grid-line-y')
        .attr('x1', 50)
        .attr('x2', width - 50)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d));
}

function updateVisualization() {
    if (movieData.length === 0) return;
    
    updateScales();
    
    // Filter data based on current filters
    const filteredData = currentFilters.length > 0 ? 
        movieData.filter(d => currentFilters.includes(d.section)) : 
        movieData;
    
    const mainGroup = svg.select('.main-group');
    
    // Add subtle grid lines for better visual structure
    addGridLines(mainGroup);
    
    // Bind data to circles
    const circles = mainGroup.selectAll('.circle')
        .data(filteredData, d => d.title);
    
    // Remove old circles
    circles.exit()
        .transition()
        .duration(300)
        .attr('r', 0)
        .style('opacity', 0)
        .remove();
    
    // Add new circles with staggered animation
    const newCircles = circles.enter()
        .append('circle')
        .attr('class', 'circle')
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 0)
        .style('opacity', 0)
        .style('fill', d => sectionColors[d.section] || '#b8a8d6');
    
    // Update all circles with staggered animation
    circles.merge(newCircles)
        .transition()
        .duration(600)
        .delay((d, i) => i * 2) // Staggered delay for nice wave effect
        .ease(d3.easeBackOut.overshoot(0.3))
        .attr('cx', d => xScale(d.x))
        .attr('cy', d => yScale(d.y))
        .attr('r', 6)
        .style('opacity', 1);
    
    // Add event listeners
    circles.merge(newCircles)
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
        .on('click', handleClick);
}

function handleMouseOver(event, d) {
    const tooltip = d3.select('#tooltip');
    
    // Highlight the circle
    d3.select(event.target)
        .classed('highlighted', true);
    
    // Show tooltip
    tooltip.html(`
        <div style="font-weight: 600; margin-bottom: 4px;">${d.title}</div>
        <div style="color: #94a3b8; font-size: 0.8rem;">${d.director || 'N/A'}</div>
        <div style="color: ${sectionColors[d.section] || '#b8a8d6'}; font-size: 0.8rem; margin-top: 4px;">${d.section}</div>
    `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .classed('show', true);
}

function handleMouseOut(event, d) {
    // Remove highlight
    d3.select(event.target)
        .classed('highlighted', false);
    
    // Hide tooltip
    d3.select('#tooltip')
        .classed('show', false);
}

function handleClick(event, d) {
    showMovieDetails(d);
}

function handleZoom(event) {
    const { transform } = event;
    svg.select('.main-group').attr('transform', transform);
}

function showMovieDetails(movie) {
    const detailsPanel = document.getElementById('details-panel');
    const detailsContent = document.getElementById('details-content');
    const mainContent = document.querySelector('.main-content');
    
    // Create screenings HTML
    const screeningsHTML = movie.screenings && movie.screenings.length > 0 ? 
        `<div class="screenings">
            <h4>Screenings</h4>
            ${movie.screenings.map(screening => `
                <div class="screening-item">
                    <div class="screening-datetime">${screening.full_datetime || `${screening.date}, ${screening.time}`}</div>
                    <div class="screening-venue">${screening.venue}</div>
                </div>
            `).join('')}
        </div>` : '';
    
    detailsContent.innerHTML = `
        <div class="movie-details">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-director">Directed by ${movie.director || 'N/A'}</div>
            <div class="movie-section" style="color: ${sectionColors[movie.section] || '#b8a8d6'}; border-color: ${sectionColors[movie.section] || '#b8a8d6'};">
                ${movie.section}
            </div>
            <div class="movie-description">${movie.description || 'No description available.'}</div>
            <div class="movie-meta">
                <div class="meta-item">
                    <span class="meta-label">Duration:</span>
                    <span class="meta-value">${movie.country_year_duration || 'N/A'}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Subtitles:</span>
                    <span class="meta-value">${movie.subtitles || 'N/A'}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">URL:</span>
                    <span class="meta-value">${movie.url || 'N/A'}</span>
                </div>
            </div>
            ${screeningsHTML}
        </div>
    `;
    
    // Show the panel with animation
    mainContent.classList.add('with-panel');
    detailsPanel.classList.add('show');
}

function hideMovieDetails() {
    const detailsPanel = document.getElementById('details-panel');
    const detailsContent = document.getElementById('details-content');
    const mainContent = document.querySelector('.main-content');
    
    // Hide the panel with animation
    detailsPanel.classList.remove('show');
    mainContent.classList.remove('with-panel');
    
    // Clear content after animation
    setTimeout(() => {
        detailsContent.innerHTML = '<p class="placeholder">Click on a movie to see details</p>';
    }, 300);
}



function updateMovieCount() {
    const filteredCount = currentFilters.length > 0 ? 
        movieData.filter(d => currentFilters.includes(d.section)).length : 
        movieData.length;
    
    // Update or create movie count display on the plot
    const countDisplay = svg.select('.movie-count');
    if (countDisplay.empty()) {
        svg.append('text')
            .attr('class', 'movie-count')
            .attr('x', 20)
            .attr('y', 30)
            .style('fill', '#64748b')
            .style('font-size', '14px')
            .style('font-weight', '500')
            .style('font-family', 'Inter, sans-serif');
    }
    
    const filterText = currentFilters.length > 0 ? 
        ` (${currentFilters.length} section${currentFilters.length > 1 ? 's' : ''} selected)` : '';
    
    svg.select('.movie-count')
        .text(`${filteredCount} movies${filterText}`);
}

function createLegend() {
    const legendContainer = d3.select('#legend-container')
        .append('div')
        .attr('class', 'legend');
    
    legendContainer.append('div')
        .attr('class', 'legend-title')
        .text('Sections');
    
    // Set initial state for hidden legend container
    d3.select('#legend-container').classed('hidden', true);
    
    // Set initial button state for hidden legend
    const toggleButton = document.getElementById('legend-toggle');
    const toggleText = toggleButton.querySelector('.toggle-text');
    const toggleIcon = toggleButton.querySelector('.toggle-icon');
    
    toggleText.textContent = 'Show Legend';
    toggleIcon.textContent = '👁️‍🗨️';
    
    // We'll update the legend when data is loaded
    updateLegend();
}

function toggleLegend() {
    const legendContainer = d3.select('#legend-container');
    const toggleButton = document.getElementById('legend-toggle');
    const toggleText = toggleButton.querySelector('.toggle-text');
    const toggleIcon = toggleButton.querySelector('.toggle-icon');
    
    const isHidden = legendContainer.classed('hidden');
    
    legendContainer.classed('hidden', !isHidden);
    
    if (isHidden) {
        toggleText.textContent = 'Hide Legend';
        toggleIcon.textContent = '👁️';
    } else {
        toggleText.textContent = 'Show Legend';
        toggleIcon.textContent = '👁️‍🗨️';
    }
}

function handleLegendClick(section) {
    if (section === '') {
        // Clear all filters
        currentFilters = [];
    } else {
        // Toggle section in filters array
        const index = currentFilters.indexOf(section);
        if (index > -1) {
            // Remove section from filters
            currentFilters.splice(index, 1);
        } else {
            // Add section to filters
            currentFilters.push(section);
        }
    }
    
    // Update visualization and count
    updateVisualization();
    updateMovieCount();
    updateLegend(); // Update legend active states
}

function updateLegend() {
    const legend = d3.select('.legend');
    const sections = [...new Set(movieData.map(d => d.section))].sort();
    
    // Add "All Sections" option at the top
    const allSectionsData = ['All Sections', ...sections];
    
    const legendItems = legend.selectAll('.legend-item')
        .data(allSectionsData);
    
    const legendEnter = legendItems.enter()
        .append('div')
        .attr('class', 'legend-item')
        .style('cursor', 'pointer');
    
    legendEnter.append('div')
        .attr('class', 'legend-color');
    
    legendEnter.append('span')
        .attr('class', 'legend-text');
    
    const mergedItems = legendItems.merge(legendEnter);
    
    mergedItems
        .select('.legend-color')
        .style('background-color', d => {
            if (d === 'All Sections') {
                return '#94a3b8'; // Gray for "All Sections"
            }
            return sectionColors[d] || '#b8a8d6';
        });
    
    mergedItems
        .select('.legend-text')
        .text(d => d);
    
    // Update active state based on current filters
    mergedItems
        .classed('active', d => {
            if (d === 'All Sections') {
                return currentFilters.length === 0;
            }
            return currentFilters.includes(d);
        })
        .classed('inactive', d => {
            if (d === 'All Sections') {
                return false;
            }
            return currentFilters.length > 0 && !currentFilters.includes(d);
        });
    
    // Add click event listeners
    mergedItems
        .on('click', function(event, d) {
            if (d === 'All Sections') {
                handleLegendClick('');
            } else {
                handleLegendClick(d);
            }
        });
    
    legendItems.exit().remove();
}

// Handle window resize
window.addEventListener('resize', function() {
    const container = document.querySelector('.visualization-container');
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight || 600;
    
    if (newWidth !== width || newHeight !== height) {
        width = newWidth;
        height = newHeight;
        
        svg.attr('width', width).attr('height', height);
        updateScales();
        updateVisualization();
    }
});

// Export for potential use
window.movieVisualization = {
    updateVisualization,
    showMovieDetails,
    hideMovieDetails
}; 