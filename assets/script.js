const history = $("#history");
const form = $("#search-form");
const submitBtn = $("#search-button");

//Array created to store lat and lon extracted from Geocoding API response
// !needs to be accessible from all the different functions used for that particular API
let cityCoordinates = [];

/* -------------------- FUNCTIONS -------------------- */

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

function buildGeocodingQueryURL() {
  // get user input and store it in cityName
  const cityName = $("#search-input").val().trim();
  console.log("inputed city is " + cityName);

  // create query URL(limit to 1 result)
  let geoQueryURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
  return geoQueryURL;
}

function collectCityCoordinates(response) {
  console.log(response);
  console.log(
    "From Geocoding response /n lat is " +
      response[0].lat +
      "/n lon is " +
      response[0].lon
  );

  // collect city latitude and longitude and push it to the cityCoordinates array available globally
  cityCoordinates.push(response[0].lat);
  cityCoordinates.push(response[0].lon);
}

// ! TODO: Improve - if failed then inform user accordingly
/**
 * * Call the Geocoding API and
 * * Collect the lat-lon coordinates of the user input city
 * ? @returns cityCoordinates or false?  // will dvp & modif later with IF statement depending on API response
 */
function getCityCoordinates() {
  const queryURL = buildGeocodingQueryURL();

  //call Geocoding API to extract city coordinates from the response provided
  $.ajax({
    url: queryURL,
    method: "GET",
  }).then(function (response) {
    return collectCityCoordinates(response);
  });
  // .fail(function () {
  //   console.log("ERROR ERROR");
  //   return false;
  // });

  console.log(cityCoordinates);
  return cityCoordinates;
}

// *-------------------- FUNCTIONS TO CALL CURRENT WEATHER API --------------------* //

function buildCurrentWeatherQueryURL(currentCityCoordinates) {
  console.log("at the moment we have the following coordinates");
  console.log(currentCityCoordinates);

  // split coordinates array into 2 variables `lat` & `lon`
  lat = currentCityCoordinates[0];
  lon = currentCityCoordinates[1];

  console.log("latitude :" + lat);
  console.log({ lon });

  let currentWeatherQueryURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
  console.log(currentWeatherQueryURL);
  return currentWeatherQueryURL;
}

// *-------------------- EVENT HANDLERS --------------------* //
// Event delegation - Handle form submission with submit button
form.on("submit", submitBtn, function (event) {
  event.preventDefault();

  createCityBtn();

  //Make inputed city coordinates available in this scope by storing funtion in the variable
  let currentCityCoordinates = getCityCoordinates();
  console.log("SOO");
  console.log(currentCityCoordinates);

  const currentWeatherQueryURL = buildCurrentWeatherQueryURL(
    currentCityCoordinates
  );
  console.log(currentWeatherQueryURL);
  console.log("done for now");
});
