# UK Police Stop and Check

## Overview

This project is an interactive web application that allows users to visualize stop and search data in London, as well as police station proximity using a map interface. The data includes crime data and police station locations, displayed in different formats like markers, heatmaps, and proximity analysis circles.

The application is hosted on Azure Static Web Apps and interacts with both CSV data sources and external APIs for data retrieval. 

Follow this [link](https://nice-stone-088038b03.5.azurestaticapps.net/) to see the project. 

![Screenshoot](screenshoot.png)

## Features

- **Interactive Map**: Users can view crime data across London for different months.
- **Multiple Visualizations**:
  - Markers for individual crime instances.
  - Heatmap to show density of crime across the city.
  - Proximity analysis circles to show the proximity of police stations to crime locations.
- **Month Filtering**: Users can filter the data by month and view different datasets for the respective time period.

## Data Sources

- **Crime Data**: Crime data is fetched from CSV files hosted on an Azure Blob Storage account. These CSV files contain detailed information on crime events.
- **Police Station Data**: Police station locations are fetched using **Overpass Turbo** from OpenStreetMap data, providing accurate and up-to-date positions of police stations across London.

## Coverage Area

- **Latitude**: 51.509865
- **Longitude**: -0.118092
- **Area**: The data currently covers London, focusing primarily on the central region.

## Technologies Used

- **Frontend**: The application is built with HTML, CSS, and JavaScript using the Leaflet.js library for map visualization.
- **Data Processing**: Data from CSV files is parsed using PapaParse.
- **Hosting**: The project is hosted on Azure Static Web Apps.
- **Mapping**: Leaflet.js is used to render the map, display markers, heatmaps, and perform GIS analyses like proximity circles for police stations.

## Diagram

```mermaid
graph TD
    A[User's Browser] -->|Interacts with| B[Frontend (Map Interface)]
    B -->|Fetches Data From| C[Azure Static Web App]
    C --> D[Crime Data (CSV)]
    C --> E[Police Data (API or Static Source)]
    D --> F[Markers, Heatmap, Proximity Analysis]
    E --> G[Displayed on Map]
```