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
  const iconCode = day.weather[0].icon;
  const imgURL = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
  return imgURL;
}

function extractDataOfTheDayToPopulatePage(day) {
  let dataOfTheDay = [];
  dataOfTheDay.push(`Temp: ${day.main.temp}°C`);
  dataOfTheDay.push(`Humidity: ${day.main.humidity}%`);
  dataOfTheDay.push(`Wind: ${day.wind.speed} KPH`);
  console.log(dataOfTheDay);
  return dataOfTheDay;
}

function createOneDivPerForecastDay(day, dataOfTheDay) {
  const forecastSection = $("#forecast");

  const dayDiv = $("<div>");
  dayDiv.addClass("dayDiv");

  const dayHeading = $("<h2>");
  const datePlaceholder = "01/01/2023";
  dayHeading.append(datePlaceholder);

  const dayWeatherIcon = $("<img>");
  dayWeatherIcon.attr("src", getWeatherIcon(day));

  const dayTemp = $("<p>").text(`Temp: ${dataOfTheDay[0]}°C`);
  const dayHumidity = $("<p>").text(`Humidity: ${dataOfTheDay[1]}%`);
  const dayWind = $("<p>").text(`Wind: ${dataOfTheDay[2]} KPH`);

  dayDiv.append(dayHeading, dayTemp, dayHumidity, dayWind);
  forecastSection.append(dayDiv);
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

function displayFiveDayWeather(fiveDayForecast) {
  const forecastSection = $("#forecast");

  //Make sure the requested data are only displayed once
  forecastSection.empty();

  fiveDayForecast.forEach((day) => {
    let dataOfTheDay = extractDataOfTheDayToPopulatePage(day);
    createOneDivPerForecastDay(day, dataOfTheDay);
  });
}

// *-------------------- FUNCTIONS TO CALL GEOCODING API --------------------* /
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
  return todayWeatherQueryURL;
}

// *-------------------- FUNCTIONS TO CALL 5DAYS FORECAST API --------------------* //

function buildFiveDayForecastQueryURL(currentCityCoordinates) {
  //we're sending the response as currentCityCoordinates

  // get latitude & longitude from response object
  let lat = currentCityCoordinates.lat;
  let lon = currentCityCoordinates.lon;

  let fiveDayForecastQueryURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  return fiveDayForecastQueryURL;
}

/**
 * * Extract 1 fixed time slot per day (avoiding current day since this is handle by a different API)
 * @param {*} forecastList
 * @returns [fiveDayData] array of data for next 5 days
 */
function getFiveDayForecast(forecastList) {
  console.log(forecastList);
  let fiveDayData = [];
  for (let data = 0; data < forecastList.length - 1; data += 7) {
    if (data === 0) {
      continue;
    }
    fiveDayData.push(forecastList[data]);
  }

  console.log("final");
  console.log(fiveDayData);
  console.log(fiveDayData[0]);
  return fiveDayData;
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
  console.log("GEOCODING API \n" + geocodingQueryURL);

  //call Geocoding API to extract city coordinates from the response provided
  $.ajax({
    url: geocodingQueryURL,
    method: "GET",
  })
    .then(function (response) {
      // get the lat&lon from response obj in order to build URL to call 2nd API to get today's weather
      let todayWeatherQueryURL = buildTodayWeatherQueryURL(response[0]);
      console.log("WEATHER API CALL \n" + todayWeatherQueryURL);

      // get the lat&lon from response obj in order to build URL to call 5 days forecast API
      let nextQueryURL = buildFiveDayForecastQueryURL(response[0]);

      // call api using currentWeatherQueryURL
      $.ajax({
        url: todayWeatherQueryURL,
        method: "GET",
      }).then(function (day) {
        extractDataOfTheDayToPopulatePage(day);
        displayTodayWeather(day);
        let fiveDayForecastQueryURL = nextQueryURL;
        console.log("FINAL API CALL \n" + fiveDayForecastQueryURL);

        $.ajax({
          url: fiveDayForecastQueryURL,
          method: "GET",
        }).then(function (forecast) {
          let forecastList = forecast.list;
          let fiveDayForecast = getFiveDayForecast(forecastList);
          displayFiveDayWeather(fiveDayForecast);
          console.log("DONE");
        });
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
