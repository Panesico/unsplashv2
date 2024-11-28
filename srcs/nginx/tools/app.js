let accessKey;
const gallery = document.getElementById('gallery');

async function fetchPhotos(loggedIn) {
  let response;
  try {
    response = await fetch(`https://api.unsplash.com/photos?client_id=${accessKey}`);
    const photos = await response.json();
    gallery.innerHTML = "";
    photos.forEach(photo => {
      const photoElement = document.createElement('div');
      photoElement.className = 'photo';
      if (loggedIn) {
        console.log('photoElement.innerHTML:', photo);
        photoElement.innerHTML = `<img src="${photo.urls.regular}" alt="${photo.alt_description}">
        <button class="favorite-btn fancy-btn" data-id="${photo.id}">❤️</button>`;
        // Add event listener to the favorite button
        listenPhoto(photoElement, photo.id);
        
      }
      else
        photoElement.innerHTML = `<img src="${photo.urls.regular}" alt="${photo.alt_description}">`;
      gallery.appendChild(photoElement);
    });
  }
  catch (error) {
    console.error(error);
    gallery.innerHTML = "<p>Something went wrong</p>";
  }
}
async function listenPhoto(photoElement, photoId) {
  photoElement.querySelector('.favorite-btn').addEventListener('click', async (event) => {
    json_body = JSON.stringify({ photoId });
    const response = await fetch('http://localhost:3000/api/favorite',
      {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: json_body
    }
  )
    .then(response => {
      if (response.ok) {
        console.log('PhotoId added to favorites:', photoId);
      }
      else {
        console.error('An error occurred');
      }
    })
    .catch(error => console.error('Error adding photo to favorites:', error));
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch('http://localhost:3000/api/get-access-key');
  const data = await response.json();
  accessKey = data.accessKey;
  await initialize();
});

async function initialize() {
  const loggedIn = await isUserLoggedIn();
  
  // Hide the login button if logged in
  if (loggedIn) {
    document.getElementById('login').style.display = 'none';
    handlesButtons();
  }
  fetchPhotos(loggedIn);
}

function handlesButtons() {
  document.getElementById('login').style.display = 'none';
  document.getElementById('favorites').style.display = 'block';
}


async function isUserLoggedIn() {
  try {
    const response = await fetch('http://localhost:3000/api/check-auth'); // Use the correct URL
    console.log(response);
    if (response.ok) {
      const data = await response.json();
      loggedIn = data.loggedIn;
      return data.loggedIn;
    }
    else {
      console.error('An error occurred');
      return false;
    }
  }
  catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
}

// Logic to redirect users to Unsplah for authentication
document.getElementById('login').addEventListener('click', () => {
  window.location.href = "http://127.0.0.1:3000/auth/login";
});

// Logic to search for photos
document.getElementById('search-button').addEventListener('click', async (event) => {
  const query = document.getElementById('query').value;
  console.log('Query: ', query);
  const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&client_id=${accessKey}`);
  const data = await response.json();
  gallery.innerHTML = "";
  data.results.forEach(photo => {
    const photoElement = document.createElement('div');
    photoElement.className = 'photo';
    photoElement.innerHTML = `<img src="${photo.urls.regular}" alt="${photo.alt_description}">
    <button class="favorite-btn" data-id="${photo.id}">❤️</button>`;
    listenPhoto(photoElement, photo.id);
    gallery.appendChild(photoElement);
    });
  }
);

document.getElementById('favorites').addEventListener('click', async () => {
  const response = await fetch('http://localhost:3000/api/favorites');
  const data = await response.json();
  gallery.innerHTML = "";
  console.log('favorits > data:', data);
  // get favorits array from data
  favorites = data.favorites;
  if (Array.isArray(favorites)) {
    favorites.forEach(async (photo) => {
      console.log('photo:', photo);
      const response_data = await fetch(`https://api.unsplash.com/photos/${photo}?client_id=${accessKey}`);
      const photoData = await response_data.json();
      console.log('photo.urls:', photoData.urls);
      const photoElement = document.createElement('div');
      photoElement.className = 'photo';
      photoElement.innerHTML = `<img src="${photoData.urls.regular}" alt="${photoData.alt_description}">`;
      gallery.appendChild(photoElement);
    });
  } else {
    console.error('Data is not an array:', favorites);
  }
  }
);