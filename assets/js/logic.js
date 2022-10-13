// Global variables
var searchHistory = [];
var weatherUrl = "https://api.openweathermap.org/data/3.0/onecall?";
var apikey = "6779df867729d0c51536a7a447ed2011";

// DOM element references
var searchInput = $("#cityName");
var todayWeather = $(".rightNow");
var forcast = $(".five-day");
// search history container


// Function to display the search history list.
function renderSearchHistory() {
    $(".storedBtn").remove();
    // loop through the history array creating a button for each item
    for (let i = 0; i < searchHistory.length; i++) {
        const element = searchHistory[i];

        var btnEl = $("<button class='btn storedBtn'></button>").text(element);
        // append to the search history container
        $(".search").append(btnEl);  
    }
}

// Function to update history in local storage then updates displayed history.
function appendToHistory(search) {
    //check for repeated values
    for (let i = 0; i < searchHistory.length; i++) {
        const history = searchHistory[i];
        if (history == search) {
            return;
        }
        
    }

    // push search term into search history array
    searchHistory.push(search);
    localStorage.setItem("cities", JSON.stringify(searchHistory));

    // set search history array to local storage
    renderSearchHistory();
}

// Function to get search history from local storage
function initSearchHistory() {
    // get search history item from local storage
    if (localStorage.getItem("cities")!==null) {
        searchHistory= JSON.parse(localStorage.getItem("cities"));
    }
    else{
        localStorage.setItem("cities", JSON.stringify(searchHistory));
    }
    // set search history array equal to what you got from local storage
    renderSearchHistory();
}

// Function to display the CURRENT weather data fetched from OpenWeather api.
function renderCurrentWeather(city, weather) {
    // Store response data from our fetch request in variables
    // temperature, wind speed, etc.
    var temp = weather.temp;
    var wind = weather.wind_speed;
    var humidity = weather.humidity;
    var clouds = weather.clouds;
    //convert time to date
    var date = new Date(weather.sunrise*1000)
    date= date.toLocaleDateString('en-US');
    //☀️🌤️⛅☁️
    if (clouds>50) {
        clouds="☁️";
        } else if(clouds>30) {
        clouds="⛅";
        } else if(clouds>10) {
        clouds="🌤️";
        } else {
        clouds="☀️";
        }

    // dynamically create the elements 
    var cityDateEl = $("<h3></h3>").text(city+" ("+date+") "+clouds);
    var tempEl = $("<div></div>").text("Temp: "+temp+"°F");
    var windEl = $("<div></div>").text("Wind: "+wind+" MPH");
    var humidityEl = $("<div></div>").text("Humidity: "+humidity+"%");

    // append to .rightNow
    $(".rightNow").append(cityDateEl, tempEl, windEl, humidityEl);  
}

function renderForecastCard(forecast) {
    // variables for data from api
    var temp = forecast.temp.day;
    var wind = forecast.wind_speed;
    var humidity = forecast.humidity;
    var clouds = forecast.clouds;
    //convert time to date
    var date = new Date(forecast.sunrise*1000)
    date= date.toLocaleDateString('en-US');
    //☀️🌤️⛅☁️
    if (clouds>50) {
    clouds="☁️";
    } else if(clouds>30) {
    clouds="⛅";
    } else if(clouds>10) {
    clouds="🌤️";
    } else {
    clouds="☀️";
    }

    var cardEl = $("<div class='col-2 cards'></div>")
    
    $(".cardRow").append(cardEl); 

    // Create elements for a card
    var dateEl = $("<h4></h4>").text(date);
    var cloudsEl = $("<div></div>").text(clouds);
    var tempEl = $("<div></div>").text("Temp: "+temp+"°F");
    var windEl = $("<div></div>").text("Wind: "+wind+" MPH");
    var humidityEl = $("<div></div>").text("Humidity: "+humidity+"%");

    $(cardEl).append(dateEl, cloudsEl, tempEl, windEl, humidityEl);  

}

// Function to display 5 day forecast.
function renderForecast(dailyForecast) {
    // loop over dailyForecast
    for (var i = 1; i < 6; i++) {
        // send the data to our renderForecast function as an argument
        renderForecastCard(dailyForecast[i]);
    }
}

function renderItems(city, data) {
    renderCurrentWeather(city, data.current);
    renderForecast(data.daily);
}

function fetchWeather(location) {
    var lat = location[0].lat;
    var lon = location[0].lon;
    var city = location[0].name;
    // fetch, using the api url, .then that returns the response as json, .then that calls renderItems(city, data)
    fetch(weatherUrl+"lat="+lat+"&lon="+lon+"&units=imperial&exclude=hourly,minutely,alerts&appid="+apikey)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        renderItems(city,data);
        appendToHistory(city);
    });
}

function fetchCoords(search) {
    var geoUrl = "http://api.openweathermap.org/geo/1.0/direct?q=";

    fetch(geoUrl+search+"&limit=1&appid="+apikey)
    .then(function (response) {
        return response.json();
        })
    .then(function (data) {
        if (!data[0]) {
            return;
        }
    clearScreen();
    fetchWeather(data);
        });
}

function clearScreen(){
    $(".cardRow").empty();
    $(".rightNow").empty();
}

function handleSearchFormSubmit(e) {
    // Don't continue if there is nothing in the search form
    console.log("You clicked search");
    if (!searchInput.val()) {
        return;
    }

    e.preventDefault();
    var search = searchInput.val().trim();
    fetchCoords(search);
    searchInput.val("");
}

function handleSearchHistoryClick(e) {
    // grab whatever city is is they clicked
    e.preventDefault();
    var search = $(this).text().trim();
    fetchCoords(search);
}

initSearchHistory();
// click event to run the handleFormSubmit 
$("#searchBtn").on("click", handleSearchFormSubmit);
// click event to run the handleSearchHistoryClick
$(document).on("click", ".storedBtn", handleSearchHistoryClick);