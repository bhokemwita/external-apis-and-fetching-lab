// index.js
const weatherApi = "https://api.weather.gov/alerts/active?area="

// Function to validate state abbreviation (two capital letters)
function validateStateAbbr(abbr) {
  return /^[A-Z]{2}$/.test(abbr);
}

// Function to toggle loading indicator
function toggleLoading(isLoading) {
  const loadingDiv = document.getElementById("loading");
  if (isLoading) {
    loadingDiv.classList.remove("hidden");
  } else {
    loadingDiv.classList.add("hidden");
  }
}

// Function to fetch weather alerts for a given state
function fetchWeatherAlerts(state) {
  // Show loading indicator
  toggleLoading(true);
  
  // Clear the input field
  document.getElementById("state-input").value = "";
  
  fetch(`${weatherApi}${state}`)
    .then(response => response.json())
    .then(data => {
      console.log("Weather Alerts Data:", data);
      displayAlerts(data);
    })
    .catch(error => {
      console.log("Error fetching weather alerts:", error);
      displayError(error.message);
    })
    .finally(() => {
      toggleLoading(false);
    });
}

// Function to display alerts in the DOM
function displayAlerts(data) {
  const alertsDisplay = document.getElementById("alerts-display");
  
  // Create summary message
  const alertCount = data.features ? data.features.length : 0;
  const summaryMessage = `Current watches, warnings, and advisories for ${data.title}: ${alertCount}`;
  
  // Create the summary heading
  const summaryDiv = document.createElement("div");
  summaryDiv.innerHTML = `<h2>${summaryMessage}</h2>`;
  
  // Create list of headlines
  const headlinesList = document.createElement("ul");
  
  if (data.features && data.features.length > 0) {
    data.features.forEach(alert => {
      const listItem = document.createElement("li");
      listItem.textContent = alert.properties.headline;
      headlinesList.appendChild(listItem);
    });
  } else {
    const noAlertsItem = document.createElement("li");
    noAlertsItem.textContent = "No active alerts";
    headlinesList.appendChild(noAlertsItem);
  }
  
  // Clear previous content and display new content
  alertsDisplay.innerHTML = "";
  alertsDisplay.appendChild(summaryDiv);
  alertsDisplay.appendChild(headlinesList);
  
  // Clear and hide error message on successful request
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = "";
  errorDiv.classList.add("hidden");
  errorDiv.classList.remove("error");
}

// Function to display error message
function displayError(message) {
  const errorDiv = document.getElementById("error-message");
  errorDiv.textContent = message;
  errorDiv.classList.remove("hidden");
  errorDiv.classList.add("error");
  toggleLoading(false);
}

// Event listener for the fetch button
document.getElementById("fetch-alerts").addEventListener("click", () => {
  const stateInput = document.getElementById("state-input").value.trim().toUpperCase();
  
  if (!stateInput) {
    displayError("Please enter a state abbreviation.");
  } else if (!validateStateAbbr(stateInput)) {
    displayError("Please enter a valid 2-letter state abbreviation (e.g., CA, NY).");
  } else {
    fetchWeatherAlerts(stateInput);
  }
});