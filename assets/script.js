const history = $("#history");
const form = $("#search-form");
const submitBtn = $("#search-button");

/* -------------------- FUNCTIONS -------------------- */

// *-------------------- FUNCTIONS TO MODIFY DOCUMENT ELEMENTS --------------------* //

function getTodaysDate() {
  let today = moment().format("DD/M/YYYY");
  console.log({ today });
  return today;
}

function getWeatherIcon(day) {
  console.log(day.weather[0].icon);
  const iconCode = day.weather[0].icon;
  const imgURL = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
  return imgURL;
}

function extractDataToPopulatePage(day) {
  let dataOfTheDay = [];
  dataOfTheDay.push(`Temp: ${day.main.temp}°C`);
  dataOfTheDay.push(`Humidity: ${day.main.humidity}%`);
  dataOfTheDay.push(`Wind: ${day.wind.speed} KPH`);
  console.log(dataOfTheDay);
  return dataOfTheDay;
}

/**
 * * Extract data from response object (called day) and create elements to populate todaySection accordingly
 * @param {object} day collected from API call initiated when input submit button is fired
 */
function displayTodayWeather(day) {
  const todaySection = $("#today");

  //Make sure the requested data are only displayed once
  todaySection.empty();

  const searchInput = $("#search-input").val().trim();

  const todayHeading = $("<h2>").text(`${searchInput} (${getTodaysDate()})`);
  todayHeading.addClass("h2-heading font-weight-bold");

  const weatherIcon = $("<img>");
  weatherIcon.attr("src", getWeatherIcon(day));
  todayHeading.append(weatherIcon);

  // ! TODO Adds more checks for other params
  // if (day.main.temp) {
  //   let todayTemp = $("<p>").text(`Temp: ${day.main.temp}°C`);
  //   todaySection.append(todayTemp);
  // }
  const todayTemp = $("<p>").text(`Temp: ${day.main.temp}°C`);
  const todayHumidity = $("<p>").text(`Humidity: ${day.main.humidity}%`);
  const todayWind = $("<p>").text(`Wind: ${day.wind.speed} KPH`);

  todaySection.append(todayHeading, todayTemp, todayHumidity, todayWind);
}

// *-------------------- FUNCTIONS TO CALL GEOCODING API --------------------* //

// ! TODO: Add defense, only create a button for valid day,
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
  cityBtn.addClass("city-button");
  cityBtn.text(searchInput);
  history.append(cityBtn);
}

/**
 * @return {string} geocodingQueryURL that will be used to call the API to retrieve lat&lon based on cityName
 */
function buildGeocodingQueryURL() {
  // get user input and store it in cityName
  const cityName = $("#search-input").val().trim();
  console.log("inputed day is " + cityName); // ! TODO remove this !

  // create query URL(limit to 1 result)
  // ! add more defenses for cityName
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
  // ! ADD more checks to protect your code
  let todayWeatherQueryURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  console.log(todayWeatherQueryURL);
  return todayWeatherQueryURL;
}

// *-------------------- FUNCTIONS TO CALL 5DAYS FORECAST API --------------------* //

function buildFiveDaysForecastQueryURL(currentCityCoordinates) {
  //we're sending the response as currentCityCoordinates

  // get latitude & longitude from response object
  let lat = currentCityCoordinates.lat;
  let lon = currentCityCoordinates.lon;

  let fiveDaysForecastQueryURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  console.log(fiveDaysForecastQueryURL);
  return fiveDaysForecastQueryURL;
}

// *-------------------- API CALLS --------------------* //
// ! TODO: Improve - if failed then inform user accordingly
/**
 * * Call the Geocoding API and
 * * Collect the lat-lon coordinates of the user input day
 * ? @returns cityCoordinates or false?  // will dvp & modif later with IF statement depending on API response
 */
function getCityWeather() {
  const geocodingQueryURL = buildGeocodingQueryURL();

  //call Geocoding API to extract day coordinates from the response provided
  $.ajax({
    url: geocodingQueryURL,
    method: "GET",
  })
    .then(function (response) {
      // get the lat&lon from response obj in order to build URL to call 2nd API to get today's weather
      let todayWeatherQueryURL = buildTodayWeatherQueryURL(response[0]);

      // get the lat&lon from response obj in order to build URL to call 5 days forecast API
      let nextQueryURL = buildFiveDaysForecastQueryURL(response[0]);

      // call api using currentWeatherQueryURL
      $.ajax({
        url: todayWeatherQueryURL,
        method: "GET",
      }).then(function (day) {
        console.log(day);
        extractDataToPopulatePage(day);
        displayTodayWeather(day);
        let fiveDaysForecastQueryURL = nextQueryURL;
        console.log("this is " + fiveDaysForecastQueryURL);
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
