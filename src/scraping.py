import asyncio
import json
import os
import re
from dataclasses import dataclass
from typing import Optional

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright


BASE_NH_LINK = "https://www.nowehoryzonty.pl/"
BASE_PROGRAM_LINK = "https://www.nowehoryzonty.pl/program/index"

ALL_PAGES = [
    BASE_PROGRAM_LINK,
    BASE_PROGRAM_LINK + "?page=1", 
    BASE_PROGRAM_LINK + "?page=2",
    BASE_PROGRAM_LINK + "?page=3",
]


@dataclass
class Screening:
    """Represents a single screening of a movie"""
    date: str
    time: str
    venue: str
    full_datetime: str


@dataclass
class MovieDetails:
    """Represents detailed movie information"""
    title: str
    original_title: Optional[str]
    director: str
    section: str
    description: str
    country_year_duration: str
    subtitles: Optional[str]
    screenings: list[Screening]
    url: str


def extract_links_from_program_page(html_content: str) -> list[str]:
    """
    Extract movie URLs from a program page HTML content.
    Only extracts URLs from actual movie containers (div.wiersz).
    
    Args:
        html_content: HTML content of the program page
        
    Returns:
        List of unique movie URLs (e.g., ['program/25/movie-name', ...])
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    
    movie_urls = []
    
    movie_containers = soup.find_all('div', class_=re.compile(r'\bwiersz\b'))
    
    for container in movie_containers:
        main_links = container.find_all('a', class_='undlink', href=re.compile(r'^program/25/[^/]+$'))
        for link in main_links:
            movie_urls.append(link['href'])
        
        subtitle_containers = container.find_all('td', class_='subtytul')
        for subtitle in subtitle_containers:
            subtitle_links = subtitle.find_all('a', href=re.compile(r'^program/25/[^/]+$'))
            for link in subtitle_links:
                movie_urls.append(link['href'])
    
    unique_urls = []
    seen = set()
    for url in movie_urls:
        if url not in seen:
            unique_urls.append(url)
            seen.add(url)
    
    return unique_urls


async def scrape_all_movie_links() -> list[str]:
    """
    Scrape movie links from all program pages.
    
    Returns:
        List of all unique movie URLs from all pages
    """
    all_movie_urls = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        for page_url in ALL_PAGES:
            print(f"Scraping: {page_url}")
            
            await page.goto(page_url)
            await page.wait_for_timeout(1000)
            
            html_content = await page.content()
            movie_urls = extract_links_from_program_page(html_content)
            
            print(f"Found {len(movie_urls)} movies on this page")
            all_movie_urls.extend(movie_urls)
        
        await browser.close()
    
    unique_all_urls = list(set(all_movie_urls))
    
    return unique_all_urls


def extract_movie_details_from_page(html_content: str, url: str) -> MovieDetails:
    """
    Extract movie details from a single movie page HTML.
    
    Args:
        html_content: HTML content of the movie page
        url: URL of the movie page
        
    Returns:
        MovieDetails object with extracted information
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    
    title_elem = soup.find('h1')
    title = title_elem.get_text(strip=True) if title_elem else "N/A"
    
    director_elem = soup.find('div', class_='f6 rez')
    director = director_elem.get_text(strip=True) if director_elem else "N/A"
    
    original_title = None
    country_year_duration = "N/A"
    subtitles = None
    
    small_divs = soup.find_all('div', class_='small')
    for div in small_divs:
        nag_divs = div.find_all('div', class_='nag')
        for nag_div in nag_divs:
            text = nag_div.get_text(strip=True)
            if not original_title and not any(word in text.lower() for word in ['202', '/', 'napisy']):
                original_title = text
            elif '202' in text and '/' in text:
                country_year_duration = text
            elif 'napisy:' in text.lower():
                subtitles = text
    
    section = "N/A"
    cykle_section = soup.find('div', class_='cykle')
    if cykle_section:
        section_link = cykle_section.find('a', class_='nazwacyklu')
        if section_link:
            section = section_link.get_text(strip=True)
    
    if section == "N/A":
        cycle_links = soup.find_all('a', href=re.compile(r'program/index.*idCyklu='))
        if cycle_links:
            section = cycle_links[0].get_text(strip=True)
    
    description = "N/A"
    desc_elem = soup.find('div', class_='tresc marginesy glownyop')
    if desc_elem:
        p_elem = desc_elem.find('p')
        if p_elem:
            description = p_elem.get_text(strip=True)
    
    screenings = []
    screening_divs = soup.find_all('div', class_='senpozycja sonsite klikalny')
    
    for screening_div in screening_divs:
        try:
            czas_elem = screening_div.find('span', class_='st')
            if czas_elem:
                datetime_text = czas_elem.get_text(strip=True)
                venue_elem = screening_div.find('a', class_='sa f6 tooltip')
                venue = venue_elem.get_text(strip=True) if venue_elem else "N/A"
                
                if ',' in datetime_text:
                    date_part, time_part = datetime_text.split(', ')
                    screenings.append(Screening(
                        date=date_part.strip(),
                        time=time_part.strip(),
                        venue=venue,
                        full_datetime=datetime_text
                    ))
        except Exception as e:
            continue
    
    return MovieDetails(
        title=title,
        original_title=original_title,
        director=director,
        section=section,
        description=description,
        country_year_duration=country_year_duration,
        subtitles=subtitles,
        screenings=screenings,
        url=url
    )


async def scrape_multiple_movies(movie_urls: list[str], base_url: str = "https://www.nowehoryzonty.pl/") -> list[dict]:
    """
    Scrape details for multiple movies.
    
    Args:
        movie_urls: List of relative movie URLs
        base_url: Base URL of the website
        
    Returns:
        List of MovieDetails objects
    """
    all_movie_details = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        for i, movie_url in enumerate(movie_urls):
            try:
                full_url = base_url + movie_url
                print(f"Scraping {i+1}/{len(movie_urls)}: {movie_url}")
                
                await page.goto(full_url)
                await page.wait_for_timeout(1000)
                
                html_content = await page.content()
                movie_details = extract_movie_details_from_page(html_content, movie_url)
                all_movie_details.append(movie_details)
                
                await page.wait_for_timeout(500)
                
            except Exception as e:
                print(f"Error scraping {movie_url}: {e}")
                continue
        
        await browser.close()
    
    return all_movie_details


def save_movie_details_to_json(movie_details: list[MovieDetails], filename: str = "raw_movie_details.json"):
    """Save movie details to JSON file"""
    
    movies_data = []
    for movie in movie_details:
        screenings_data = [
            {
                "date": s.date,
                "time": s.time,
                "venue": s.venue,
                "full_datetime": s.full_datetime
            }
            for s in movie.screenings
        ]
        
        movie_data = {
            "title": movie.title,
            "original_title": movie.original_title,
            "director": movie.director,
            "section": movie.section,
            "description": movie.description,
            "country_year_duration": movie.country_year_duration,
            "subtitles": movie.subtitles,
            "screenings": screenings_data,
            "url": movie.url
        }
        movies_data.append(movie_data)
    
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(movies_data, f, ensure_ascii=False, indent=2)


async def main():
    """
    Main function - scrapes all movie links and saves them.
    """
    all_movie_links = await scrape_all_movie_links()
    movie_details = await scrape_multiple_movies(all_movie_links)
    os.makedirs("data", exist_ok=True)
    save_movie_details_to_json(movie_details, os.path.join("data", "raw_movie_details.json"))
    

if __name__ == "__main__":
    asyncio.run(main())
