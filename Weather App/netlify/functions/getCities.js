export async function handler(event, context) {
  const API_KEY = process.env.WEATHER_API_KEY;
  const { query } = event.queryStringParameters;

  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`
    );

    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch city suggestions" }),
    };
  }
}
  
