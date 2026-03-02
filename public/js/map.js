module.exports.fetchCoordinates =async function fetchData(location ,country ) {
  try {
    const geoCodeResponse = await fetch(`https://api.geoapify.com/v1/geocode/search?text=${location}%20${country}&apiKey=${process.env.MAP_API_KEY}`);

    const data = await geoCodeResponse.json();
    return data;
  } catch (error) {
    console.error('Fetch failed:', error);
  }
}
