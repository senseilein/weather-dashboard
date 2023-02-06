const history = $("#history");
const form = $("#search-form");
const submitBtn = $("#search-button");

/* -------------------- FUNCTIONS -------------------- */

// *-------------------- FUNCTIONS TO MODIFY DOCUMENT ELEMENTS --------------------* //

/**
 * Extract data from response object (called city) and create elements to populate todaySection accordingly
 * @param {object} city collected from API call initiated when input submit button is fired
 */
function displayTodayWeather(city) {
  console.log("temp " + city.main.temp + "*C");
  console.log("humidity " + city.main.humidity + "%");
  console.log("Wind " + city.wind.speed + "KPH");
  // const todayTemp = city.main.temp + "°C";
  // const todayHumidity = city.main.humidity + "%";
  // const todayWind = city.wind.speed + "KPH";

  const searchInput = $("#search-input").val().trim();

  const todaySection = $("#today");
  const todayHeading = $("<h2>").text(searchInput);
  todayHeading.addClass("h2-heading");

  const todayTemp = $("<p>").text(`Temp: ${city.main.temp}°C`);
  const todayHumidity = $("<p>").text(`Humidity: ${city.main.humidity}%`);
  const todayWind = $("<p>").text(`Wind: ${city.wind.speed} KPH`);

  todaySection.append(todayHeading, todayTemp, todayHumidity, todayWind);
}

// *-------------------- FUNCTIONS TO CALL GEOCODING API --------------------* //

// ! TODO: Add defense, only create a button for valid city,
// i.e. the ones that have retrievable coordinates
// if input empty inform user accordingly and do nothing
// remove pattern tag and create function to validate input
// TODO: TBS issue with Bootstrap class my-5 not rendered when dynamically added to cityBtn
/*
 * * Create a button with user input text and
 * * Append it to the #history section (inside the aside)#
 */
function createCityBtn() {
  const searchInput = $("#search-input").val().trim();
  const cityBtn = $("<button>");
  cityBtn.addClass("btn, city-button");
  cityBtn.text(searchInput);
  history.append(cityBtn);
}

/**
 * @return {string} geocodingQueryURL that will be used to call the API to retrieve lat&lon based on cityName
 */
function buildGeocodingQueryURL() {
  // get user input and store it in cityName
  const cityName = $("#search-input").val().trim();
  console.log("inputed city is " + cityName);

  // create query URL(limit to 1 result)
  let geocodingQueryURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
  return geocodingQueryURL;
}

// *-------------------- FUNCTIONS TO CALL CURRENT WEATHER API --------------------* //

/**
 * @return {string} currentWeatherQueryURL that will be used to call the current day weather API
 */
function buildTodayWeatherQueryURL(currentCityCoordinates) {
  //we're sending the response as currentCityCoordinates

  // get latitude & longitude from response object
  let lat = currentCityCoordinates.lat;
  let lon = currentCityCoordinates.lon;

  console.log({ lat });
  console.log({ lon });

  let todayWeatherQueryURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  console.log(todayWeatherQueryURL);
  return todayWeatherQueryURL;
}

// *-------------------- API CALLS --------------------* //
// ! TODO: Improve - if failed then inform user accordingly
/**
 * * Call the Geocoding API and
 * * Collect the lat-lon coordinates of the user input city
 * ? @returns cityCoordinates or false?  // will dvp & modif later with IF statement depending on API response
 */
function getCityWeather() {
  const geocodingQueryURL = buildGeocodingQueryURL();

  //call Geocoding API to extract city coordinates from the response provided
  $.ajax({
    url: geocodingQueryURL,
    method: "GET",
  })
    .then(function (response) {
      // get the lat&lon from response obj in order to build URL to call 2nd API to get today's weather
      let todayWeatherQueryURL = buildTodayWeatherQueryURL(response[0]);

      // call api using currentWeatherQueryURL
      $.ajax({
        url: todayWeatherQueryURL,
        method: "GET",
      }).then(function (city) {
        console.log(city);
        displayTodayWeather(city);
      });
    })
    .catch(function (error) {
      console.log("ERROR", error);
      alert(
        "Sorry, we were not able to retrieve the requested data. Please try again later."
      );
      return;
    });
}

// *-------------------- EVENT HANDLERS --------------------* //
// Event delegation - Handle form submission with submit button
form.on("submit", submitBtn, function (event) {
  event.preventDefault();

  createCityBtn();

  getCityWeather();

  console.log("done for now");
});
