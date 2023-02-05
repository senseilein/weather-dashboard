const history = $("#history");

// * Create a button with user input text
function createCityBtn() {
  const searchInput = $("#search-input").val().trim();
  const cityBtn = $("<button>");
  cityBtn.addClass("btn, city-button");
  cityBtn.text(searchInput);
  history.append(cityBtn);
}
