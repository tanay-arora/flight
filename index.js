const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const path = require('path');
const airports = require('./airports.json');
const fs = require('fs');

const apiUrl = "https://api.duffel.com/air";
const headers = {
  'Accept-Encoding': 'gzip',
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Duffel-Version': 'v1',
  'Authorization': 'Bearer duffel_test_DxcWsq1ZkbhIcCWP2aiz_t4LtGR10PNRbzajrPTlvOa'
};
app.use(cors());
app.use(express.json()); 
app.use((req, res, next) => {
  if (req.url.endsWith('.html')) {
    res.status(404).send('Not Found');
  } else {
    next();
  }
});
app.use(express.static(path.join(__dirname, 'public')));

app.get('/transaction-completed-server-errorcode-501-24235dfs3fs3', async(req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'error.html'));
});
app.get('/', async(req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/search_flights', async(req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'flight-listing.html'));
});
app.get('/confirm_booking', async(req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'flight-booking.html'));
});
app.get('/api', (req, res) => {
  res.send('Api working!');
});

app.post('/submit-form', (req, res) => {
  const formData = req.body;
  console.log('Received form data:', formData);
  const csvData = Object.values(formData).join(',') + '\n';

  const filePath = 'form_data.csv';

  fs.appendFile(filePath, csvData, (err) => {
    if (err) {
      console.error('Error saving form data:', err);
      res.status(500).send('Error saving form data');
    } else {
      console.log('Form data saved successfully!');
      res.send('Form data received and saved successfully!');
    }
  });
});

app.get('/airports', async (req, res) => {
  try {
    const query = req.query.q;
    const results = airports.filter(airport => {
      return airport?.name?.toLowerCase()?.includes(query.toLowerCase()) || 
       airport?.city?.toLowerCase()?.includes(query.toLowerCase()) ||
       //airport?.country?.toLowerCase()?.includes(query.toLowerCase()) || 
       //airport?.state?.toLowerCase()?.includes(query.toLowerCase()) || 
       airport?.code?.toLowerCase()?.includes(query.toLowerCase());
  });
    res.send(results);  
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/flights', async (req, res) => {
  try {
    const { cabin_class, departure_date, destination, origin, passenger_type } = req.body;
    
    const requestData =  {
        "data": {
    "slices": [
      {
        "origin": origin,
        "destination": destination,
        "departure_date": departure_date
      }
    ],
    "payment": {
      "type": "balance",
      "currency": "USD",
    },
    "passengers": [
      {
        "type": "adult"
      }
    ],
    "cabin_class": cabin_class
  }};
    console.log(requestData);
    const response = await axios.post(apiUrl+"/offer_requests?supplier_timeout=5000", requestData,{
      headers: headers
    });

    console.log('API Response:', response.data);
    res.send(response.data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('*', (req, res) => {
  res.status(404).send('Not Found');
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
