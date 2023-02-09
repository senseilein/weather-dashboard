const history = $("#history");
const form = $("#search-form");
const submitBtn = $("#search-button");

// .hide() will be changed to .show() when we call displayFiveDayWeather()
const forecastHeading = $("#forecast-heading");
forecastHeading.hide();

const todaySection = $("#today");
todaySection.hide();

/* -------------------- LOCAL STORAGE -------------------- */
function initLocalStorage() {
  // try and get the array from ls
  let cityList = JSON.parse(localStorage.getItem("cityList"));

  // if array is empty, we create one and put it in the Local Storage
  if (!cityList) {
    localStorage.setItem("cityList", JSON.stringify([]));
  }
}
initLocalStorage();

function initCityList() {
  // we get all data from local storage
  let cityList = JSON.parse(localStorage.getItem("cityList"));

  // for each city, we render a button
  for (let i = 0; i < cityList.length; i++) {
    renderCityButtonFromLocalStorage(cityList, i);
  }
}

initCityList();

function renderCityButtonFromLocalStorage(cityList, i) {
  const cityBtn = $("<button>").text(cityList[i]);
  cityBtn.addClass("city-buttons");
  cityBtn.attr("id", cityList[i]);
  history.append(cityBtn);
}

function updateLocalStorageWithNewCity(searchInput) {
  // get the array from local storage (with whatever it has inside)
  let cityList = JSON.parse(localStorage.getItem("cityList"));

  // if searchInput doesn't already exists in the array, add the new city to the object
  if (!cityList.includes(searchInput)) {
    cityList.push(searchInput);
  }

  // if cityList.length is > 5 , delete the first item in the list (oldest city)
  if (cityList.length > 6) {
    cityList.shift();
  }

  // put the updated array back in the local storage
  localStorage.setItem("cityList", JSON.stringify(cityList));
}

/* -------------------- FUNCTIONS -------------------- */

// *-------------------- FUNCTIONS TO MODIFY AND POPULATE DOCUMENT ELEMENTS --------------------* //

function getTodaysDate() {
  let today = moment().format("DD/M/YYYY");
  console.log({ today });
  return today;
}

function getFutureDateFromToday(indexOfDay) {
  let today = moment();
  let futureDay = today.add(indexOfDay, "days").format("DD/M/YYYY");
  return futureDay;
}

function getWeatherIcon(day) {
  const iconCode = day.weather[0].icon;
  const imgURL = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
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

function createOneDivPerForecastDay(day, indexOfDay, dataOfTheDay) {
  const forecastSection = $("#forecast");

  const dayDiv = $("<div>");
  dayDiv.addClass("dayDiv");

  const dayHeading = $("<h2>").text(getFutureDateFromToday(indexOfDay));

  const dayWeatherIcon = $("<img>");
  dayWeatherIcon.attr("src", getWeatherIcon(day));

  const dayTemp = $("<p>").text(`Temp: ${dataOfTheDay[0]}`);
  const dayHumidity = $("<p>").text(`Humidity: ${dataOfTheDay[1]}`);
  const dayWind = $("<p>").text(`Wind: ${dataOfTheDay[2]}`);

  dayDiv.append(dayHeading, dayWeatherIcon, dayTemp, dayHumidity, dayWind);
  forecastSection.append(dayDiv);
}

/**
 * * Extract data from response object (called day) and create elements to populate todaySection accordingly
 * @param {object} day collected from API call initiated when input submit button is fired
 */
function displayTodayWeather(day, cityName) {
  const todaySection = $("#today");

  //Make sure the requested data are only displayed once
  todaySection.empty();

  todaySection.show();

  const todayHeading = $("<h2>").text(`${cityName} (${getTodaysDate()})`);
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
  const forecastHeading = $("#forecast-heading");

  //Make sure the requested data are only displayed once
  forecastSection.empty();
  forecastHeading.show();

  fiveDayForecast.forEach((day, index) => {
    let dataOfTheDay = extractDataOfTheDayToPopulatePage(day);
    createOneDivPerForecastDay(day, index, dataOfTheDay);
  });
}

function clearInputField() {
  const inputField = $("#search-input");
  inputField.val("");
}

// *-------------------- FUNCTIONS TO CALL GEOCODING API --------------------* /
// ! TODO: Add defense, only create a button for valid day,
// i.e. the ones that have retrievable coordinates
// if input empty inform user accordingly and do nothing
// remove pattern tag and create function to validate input
// TODO: TBS issue with Bootstrap class my-5 not rendered when dynamically added to cityBtn

function checkInputValidity(searchInput) {
  const authorizedChar = /^[a-zA-Z\s]*$/gi;

  if (!searchInput) {
    console.log("wrong string");
    return false;
  }

  if (searchInput.match(authorizedChar)) {
    console.log(searchInput + ": contains only letters and spaces");
    return true;
  }

  console.log("special character alert!");
  return false;
}

function getCityNameFromInput() {
  const searchInput = $("#search-input").val().trim();
  const isCityNameValid = checkInputValidity(searchInput);

  if (!isCityNameValid) {
    return "";
  }
  return searchInput;
}

// ! Add or Update function to check for valid input (then remove html input pattern) against regex
// alphabet = /^[A-Za-z]+$/
// ! return Capitalize cityNAame (then remove that style from css)

/*
 * * Create a button with user input text and
 * * Append it to the #history section (inside the aside)#
 */
function createCityBtn() {
  const searchInput = getCityNameFromInput();

  // get the array from local storage and check if the inputed city was already looked up
  // if yes, exit the function and do not create a button (since it already exists)
  // if the searchInput is invalid, exit
  let cityList = JSON.parse(localStorage.getItem("cityList"));
  if (cityList.includes(searchInput) || searchInput === "") {
    return;
  }

  const cityBtn = $("<button>");
  cityBtn.attr("id", searchInput);
  cityBtn.addClass("city-buttons");
  cityBtn.text(searchInput);
  history.append(cityBtn);

  updateLocalStorageWithNewCity(searchInput);
  checkNumberOfCitiesInHistory();
  clearInputField();
}

function checkNumberOfCitiesInHistory() {
  const history = $("#history");
  const numOfChildren = history.children().length;

  if (numOfChildren > 6) {
    //Remove first button in the #history div so that there are only 6 buttons max at any given time
    history.children(0)["0"].remove();
  }
  return;
}

/**
 * @return {string} geocodingQueryURL that will be used to call the API to retrieve lat&lon based on cityName
 * @param cityName will be passed from mother function getCityWeather()
 */
function buildGeocodingQueryURL(cityName) {
  // create query URL(limit to 1 result)
  // ! add more defense for cityName
  let geocodingQueryURL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
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
function getCityWeather(cityName) {
  const geocodingQueryURL = buildGeocodingQueryURL(cityName);
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
        displayTodayWeather(day, cityName);
        let fiveDayForecastQueryURL = nextQueryURL;
        console.log("FINAL API CALL \n" + fiveDayForecastQueryURL);

        $.ajax({
          url: fiveDayForecastQueryURL,
          method: "GET",
        }).then(function (forecast) {
          let forecastList = forecast.list;
          let fiveDayForecast = getFiveDayForecast(forecastList);
          displayFiveDayWeather(fiveDayForecast);
          console.log("DONE " + cityName);
          //create a btn only if no error occurs
          createCityBtn();
        });
      });
    })
    .catch(function (error) {
      console.log("ERROR", error);
      alert(
        "Sorry, we were not able to retrieve the requested data. Please try again later."
      );
      return false;
    });

  return true;
}

// *-------------------- EVENT HANDLERS --------------------* //

// Event delegation - Handle form submission with submit button
form.on("submit", submitBtn, function (event) {
  event.preventDefault();
  const cityName = getCityNameFromInput();
  getCityWeather(cityName);
});

// Listen for clicks on city-buttons
const cityBtn = $(".city-buttons");
cityBtn.on("click", function (event) {
  console.log(event);
  const cityName = event.currentTarget.outerText;
  getCityWeather(cityName);
});
