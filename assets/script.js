const history = $("#history");

// ! TODO: Add guard, only create a button for valid city, i.e. the ones that have retrievable coordinates
/**
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

// ! TODO: Improve - if failed inform user accordingly

/**
 * * Retrieve the lat-lon coordinates of the user input city
 * @returns {array} [lat, lon]
 */
function getCityCoordinates(event) {
  // this will be a callback function used for input submit button click handler
  event.preventDefault();

  // get user input and store it in cityName
  const cityName = $("#search-input").val().trim();
  console.log({ cityName });

  // create query URL (limit to 1 result)
  let geoQueryURL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;
  let cityCoordinates = [];

  //call Geocoding API to retrieve city coordinates
  $.ajax({
    url: geoQueryURL,
    method: "GET",
  })
    .then(function (response) {
      console.log("response");
      console.log(response);
      console.log("data below");
      console.log(response[0].lat);
      console.log(response[0].lon);

      // collect city latitude and longitude and push it the the cityCoordinates array
      let cityLat = response[0].lat;
      let cityLon = response[0].lon;

      cityCoordinates.push(cityLat);
      cityCoordinates.push(cityLon);
    })
    .fail(function () {
      console.log("ERROR ERROR");
    });

  return cityCoordinates;
}

// $("#search-button").on("click", function (event) {
//   createCityBtn();
//   getCityCoordinates(event);
// });
