const fs = require('fs');
const axios = require('axios');

const apiUrl = 'https://api.duffel.com/air/airports';
const apiKey = 'YOUR_DUFFEL_API_KEY';
const outputFile = 'airports.json';

// Function to fetch airports for a given offset
async function fetchAirports(offset = '') {
    try {
        const response = await axios.get(`${apiUrl}?after=${offset}&limit=200`, {
            headers: {
                'Content-Type': 'application/json',
                'Duffel-Version': 'v1',
                'Authorization': 'Bearer duffel_test_caUtCAADJqtJXJPF1nH8wz2lDqRFYu2QPg-eA729Hkb'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching airports:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function writeAirportsToFile(data) {
    try {
        await fs.promises.writeFile(outputFile, JSON.stringify(data, null, 2));
        console.log('Airports data written to', outputFile);
    } catch (error) {
        console.error('Error writing airports data to file:', error);
    }
}

// Function to fetch all airports and store them in the output file
async function fetchAndWriteAirports() {
    let airports = [];
    let offset = '';
    i=0;
    do {
        i++;
        console.log("itr "+i)
        const response = await fetchAirports(offset);
        if (!response) break;

        airports = airports.concat(response.data);
        offset = response.meta.after;
    } while (offset);

    await writeAirportsToFile(airports);
}

// Fetch and write airports data
fetchAndWriteAirports();
