const fetch = require('node-fetch');
const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');
const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Declare the database
let database = {};

// Load sensitive information from environment variables
const clientId = process.env.ACCESS_KEY;
const clientSecret = process.env.SECRET_KEY;
const redirectUri = process.env.REDIRECT_URI;
let loggedIn = false;


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.get('/api/get-access-key', (req, res) => {
  res.json({ accessKey: clientId });
  }
);

// Redirect user to Unsplash authorization page
app.get('/auth/login', (req, res) => {
    const authUrl = `https://unsplash.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=public`;
    res.redirect(authUrl);
});

// Handle callback from Unsplash
app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  // Make a POST request to https://unsplash.com/oauth/token with the code
  try {
    const response = await axios.post('https://unsplash.com/oauth/token', {
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code: code,
      grant_type: 'authorization_code'
    });
    const accessToken = response.data.access_token;
    // redirect to homepage
    res.redirect('http://localhost:8443/');
    // Redirect user to the home page
    loggedIn = true;
  }
  catch (error) {
    console.error(error);
    res.send('An error occurred');
  }
}
);

// Check if user is authenticated
app.get('/api/check-auth', (req, res) => {
  res.json({ loggedIn: loggedIn });
});

// Handle favorites pictures
let favorites = [];
app.post('/api/favorite', (req, res) => {
  const { photoId } = req.body;

  // Save in database
  if (!favorites.includes(photoId)) {
    favorites.push(photoId);
    res.json({ status: 'added' });
  }
  else {
    res.json({ status: 'already added' });
  }
});

app.get('/api/favorites', (req, res) => {
  res.json({ favorites });
});
