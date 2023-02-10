// ! TODO: Improve - if failed then inform user accordingly with a nice modal - replace current alert()

const history = $("#history");
const form = $("#search-form");
const submitBtn = $("#search-button");

// the todaySection along with forecastHeading will be changed from hide() to show() when we call displayFiveDayWeather()
const forecastHeading = $("#forecast-heading");
forecastHeading.hide();

const todaySection = $("#today");
todaySection.hide();

/* ---------------------------------------- LOCAL STORAGE ---------------------------------------- */

function initLocalStorage() {
  // try and get the array from Local Storage
  let cityList = JSON.parse(localStorage.getItem("cityList"));

  // if array doesn't exist, we create one and put it in the Local Storage
  if (!cityList) {
    localStorage.setItem("cityList", JSON.stringify([]));
  }
}

//* function to render city-buttons for cities stored in local Storage when page is loaded
//* this function use renderCityButtonFromLocalStorage(cityList, i) as a callback function

function initCityList() {
  // we get the cityList array from local storage
  let cityList = JSON.parse(localStorage.getItem("cityList"));

  // for each city, we render a button on the page
  for (let i = 0; i < cityList.length; i++) {
    renderCityButtonFromLocalStorage(cityList, i);
  }
}

//* We initialise local Storage immediately
initLocalStorage();

initCityList();

//* helper function for initCityList()
function renderCityButtonFromLocalStorage(cityList, i) {
  const cityBtn = $("<button>").text(cityList[i]);
  cityBtn.addClass("city-buttons");
  cityBtn.attr("id", cityList[i]);
  history.append(cityBtn);
}

//* function to add cities to cityList in local Storage based on input and limit number of cities to 6
// function used in createCityBtn() (only once input is considered as valid)
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

/* ---------------------------------------- FUNCTIONS ---------------------------------------- */

// *--------------------------------------------------- FUNCTIONS TO MODIFY AND POPULATE DOCUMENT ELEMENTS ---------------------------------------------------* //

function getTodaysDate() {
  let today = moment().format("DD/M/YYYY");
  console.log({ today });
  return today;
}

//* function used for each day in createOneDivPerForecastDay()
function getFutureDateFromToday(indexOfDay) {
  let today = moment();
  let futureDay = today.add(indexOfDay + 1, "days").format("DD/M/YYYY");
  return futureDay;
}

//* function used for each day in createOneDivPerForecastDay()
//  more details about weather icons > https://openweathermap.org/weather-conditions
function getWeatherIcon(day) {
  const iconCode = day.weather[0].icon;
  const imgURL = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  return imgURL;
}

//* function used in displayFiveDayWeather() for each forecast day
//  @return text to populate temp/humidity/wind paragraph in #forecast section
function extractDataOfTheDayToPopulatePage(day) {
  let dataOfTheDay = [];
  dataOfTheDay.push(`Temp: ${day.main.temp}°C`);
  dataOfTheDay.push(`Humidity: ${day.main.humidity}%`);
  dataOfTheDay.push(`Wind: ${day.wind.speed} KPH`);
  console.log(dataOfTheDay);
  return dataOfTheDay;
}

//* function used in displayFiveDayWeather() to populate .dayDiv and append them to the 5 day forecast section
//  helper functions getFutureDateFromToday(indexOfDay) & getWeatherIcon(day)
function createOneDivPerForecastDay(day, indexOfDay, dataOfTheDay) {
  const forecastSection = $("#forecast");

  const dayDiv = $("<div>");
  dayDiv.addClass("dayDiv");

  const dayHeading = $("<h2>").text(getFutureDateFromToday(indexOfDay));

  const dayWeatherIcon = $("<img>");
  dayWeatherIcon.attr("src", getWeatherIcon(day));

  const dayTemp = $("<p>").text(dataOfTheDay[0]);
  const dayHumidity = $("<p>").text(dataOfTheDay[1]);
  const dayWind = $("<p>").text(dataOfTheDay[2]);

  dayDiv.append(dayHeading, dayWeatherIcon, dayTemp, dayHumidity, dayWind);
  forecastSection.append(dayDiv);
}

/**
 * * Extract data from response object (called day here) and create elements to populate todaySection accordingly
 * @param day collected from current Weather API call (initiated when input submit button is fired)
 * function called within 2nd ajax().then() method in main function getCityWeather()
 * ? cases when call to API fails/ cityName is invalid / error occurs are managed directly in the ajax().then().cath() in getCityWeather() funtion
 */
function displayTodayWeather(day, cityName) {
  const todaySection = $("#today");

  //Make sure the requested data are only displayed once
  todaySection.empty();

  // this is hidden at the beginning of the session, only shown once we actually have some data to display
  todaySection.show();

  const todayHeading = $("<h2>").text(`${cityName} (${getTodaysDate()})`);
  todayHeading.addClass("h2-heading font-weight-bold");

  const weatherIcon = $("<img>");
  weatherIcon.attr("src", getWeatherIcon(day));
  todayHeading.append(weatherIcon);

  const todayTemp = $("<p>").text(`Temp: ${day.main.temp}°C`);
  const todayHumidity = $("<p>").text(`Humidity: ${day.main.humidity}%`);
  const todayWind = $("<p>").text(`Wind: ${day.wind.speed} KPH`);

  todaySection.append(todayHeading, todayTemp, todayHumidity, todayWind);
}

/**
 * * Extract data from response object (fiveDayForecast) and create elements to populate todaySection accordingly
 * @param fiveDayForecast collected from 5-day-forecast API call
 * function called within 2nd ajax().then() method in main function getCityWeather()
 * ? cases when call to API fails/ cityName is invalid / error occurs are managed directly in the ajax().then().cath() in getCityWeather() funtion
 * helper functions: extractDataOfTheDayToPopulatePage(day) & createOneDivPerForecastDay(day, index, dataOfTheDay)
 */
function displayFiveDayWeather(fiveDayForecast) {
  const forecastSection = $("#forecast");
  const forecastHeading = $("#forecast-heading");

  //Make sure the requested data are only displayed once
  forecastSection.empty();

  // this is hidden at the beginning of the session, only shown once we actually have some data to display
  forecastHeading.show();

  fiveDayForecast.forEach((day, index) => {
    let dataOfTheDay = extractDataOfTheDayToPopulatePage(day);
    createOneDivPerForecastDay(day, index, dataOfTheDay);
  });
}

// helper function in createCityBtn()
function clearInputField() {
  const inputField = $("#search-input");
  inputField.val("");
}

// *--------------------------------------------------- FUNCTIONS TO CALL GEOCODING API ---------------------------------------------------* /

// helper function for getCityNameFromInput()
// * Valid inputs contain only letters and spaces (e.g. "Los Angeles" but NOT Los-Angeles)
function checkInputValidity(searchInput) {
  // detailed Regex explanation available here > https://regex101.com/
  const authorizedChar = /^[a-zA-Z\s]*$/gi;

  // if the input is empty > invalid
  if (!searchInput) {
    return false;
  }

  // if input contains only letters and spaces > valid
  if (searchInput.match(authorizedChar)) {
    return true;
  }

  // if the above is not true, it mmeans it includes some special characters > invalid
  return false;
}

/**
 * * first checkInputValidity(searchInput)then if valid,
 * @return capitalizeCityName(searchInput)
 * or empty "" (in this case no button will be create, no API call will be made and nothing will be added to local Storage)
 */
function getCityNameFromInput() {
  const searchInput = $("#search-input").val().trim();
  const isCityNameValid = checkInputValidity(searchInput);

  if (!isCityNameValid) {
    return "";
  }

  return capitalizeCityName(searchInput);
}

function capitalizeCityName(input) {
  let cityName = input.split(" ");

  let capitalizeCityName = cityName.map((word) => {
    const firstLetter = word[0].toUpperCase();
    console.log(firstLetter);
    const restOfWord = word.substring(1).toLowerCase();
    console.log(restOfWord);
    return firstLetter + restOfWord;
  });
  return capitalizeCityName.join(" ");
}

// if we were able to get a valid searchInput > we createCityBtn()
// then updateLocalStorageWithNewCity(searchInput)
// then we checkNumberOfCitiesInHistory() > if we have more than 6 cities, the oldest one is removed
// and finally clearInputField()

function createCityBtn() {
  const searchInput = getCityNameFromInput();

  // get the array from local storage and check if the inputed city was already looked up
  // if yes, exit the function and do not create a button (since it already exists)
  // if the searchInput is invalid, exit as well
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
  // ? create query URL(limit to 1 result)
  let geocodingQueryURL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
  return geocodingQueryURL;
}

// *---------------------------------------- FUNCTIONS TO CALL CURRENT WEATHER API ----------------------------------------* //
// https://openweathermap.org/current

/**
 * @return {string} currentWeatherQueryURL that will be used to call the current day weather API
 * @param currentCityCoordinates is the response from Geocoding API
 * any error will be catch in "motherfunction" getCityWeather()
 */
function buildTodayWeatherQueryURL(currentCityCoordinates) {
  //we're sending the response as currentCityCoordinates

  // get latitude & longitude from response object
  let lat = currentCityCoordinates.lat;
  let lon = currentCityCoordinates.lon;

  let todayWeatherQueryURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  return todayWeatherQueryURL;
}

// *---------------------------------------- FUNCTIONS TO CALL 5DAYS FORECAST API ----------------------------------------* //
// 5-day forecast includes weather forecast data with 3-hour step (during 5days) > https://openweathermap.org/forecast5

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
 * @param forecastList is extracted from the response from 5-day-API call
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

// *---------------------------------------- FUNCTION USED FOR API CALLS ----------------------------------------* //

/**
 * * Call the Geocoding API and Collect the lat-lon coordinates of the user input city
 * * This allows us to call current Weather API and 5 day forecast
 */
function getCityWeather(cityName) {
  const geocodingQueryURL = buildGeocodingQueryURL(cityName);

  //call Geocoding API to extract city coordinates from the response provided
  $.ajax({
    url: geocodingQueryURL,
    method: "GET",
  })
    .then(function (response) {
      // get the lat&lon from response obj in order to build URL to call 2nd API to get today's weather
      let todayWeatherQueryURL = buildTodayWeatherQueryURL(response[0]);

      // get the lat&lon from response obj in order to build URL to call 5 days forecast API
      let nextQueryURL = buildFiveDayForecastQueryURL(response[0]);

      // call api using currentWeatherQueryURL
      $.ajax({
        url: todayWeatherQueryURL,
        method: "GET",
      }).then(function (day) {
        //Update webpage with weather data for the current day
        extractDataOfTheDayToPopulatePage(day);
        displayTodayWeather(day, cityName);

        //Pass it here in order to make it available in the next ajax()
        let fiveDayForecastQueryURL = nextQueryURL;

        $.ajax({
          url: fiveDayForecastQueryURL,
          method: "GET",
        }).then(function (forecast) {
          // the forecast.list is the bit we need to extract from the forecast response
          let forecastList = forecast.list;

          let fiveDayForecast = getFiveDayForecast(forecastList);

          //Update webpage with weather data for the 5 days
          displayFiveDayWeather(fiveDayForecast);

          //create a btn only if no error occurs
          createCityBtn();
        });
      });
    })
    .catch(function (error) {
      console.log("ERROR", error);
      alert(
        "Sorry, we were not able to retrieve the requested data. Please check the spelling or try again later."
      );
      return false;
    });

  return true;
}

// *---------------------------------------- EVENT HANDLERS ----------------------------------------* //

// Event delegation - Handle form submission with submit button
form.on("submit", submitBtn, function (event) {
  event.preventDefault();
  const cityName = getCityNameFromInput();
  getCityWeather(cityName);
});

// Listen for clicks on city-buttons
const cityBtn = $(".city-buttons");
cityBtn.on("click", function (event) {
  const cityName = event.currentTarget.outerText;
  getCityWeather(cityName);
});
