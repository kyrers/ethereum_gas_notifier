document.addEventListener("DOMContentLoaded", () => {
  const low = document.getElementById("low");
  const average = document.getElementById("average");
  const high = document.getElementById("high");
  const thresholdInput = document.getElementById("thresholdInput");
  const notifyButton = document.getElementById("notifyButton");
  const message = document.getElementById("message");

  const updateGasPriceUI = (gasPrices) => {
    low.innerText = parseFloat(gasPrices.low).toFixed(2);
    average.innerText = parseFloat(gasPrices.average).toFixed(2);
    high.innerText = parseFloat(gasPrices.high).toFixed(2);
  };

  const fetchGasPrices = () => {
    chrome.runtime.sendMessage({ type: "FETCH_GAS_PRICES" }, (response) => {
      if (response && response.success) {
        updateGasPriceUI(response.gasPrices);
      } else {
        console.error("Error fetching gas prices:", response.error);
        alert("Failed to fetch gas prices. Please try again later.");
      }
    });
  };

  // Save threshold and reset notify flag
  const saveThreshold = () => {
    const thresholdValue = parseFloat(thresholdInput.value);
    if (isNaN(thresholdValue) || thresholdValue <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    chrome.storage.sync.set(
      { gasThreshold: thresholdValue, notify: true },
      () => {
        message.innerText = `You'll be warned!`;
        message.classList.remove("hidden");
        setTimeout(() => message.classList.add("hidden"), 3000);
      }
    );
  };

  // Load the saved threshold when the popup, but only display it if no notification about it has been sent already
  chrome.storage.sync.get(["gasThreshold", "notify"], (data) => {
    if (data.gasThreshold && data.notify) {
      thresholdInput.value = data.gasThreshold;
    }
  });

  // Listen for gas price updates from background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "GAS_PRICES_UPDATED") {
      updateGasPriceUI(message.gasPrices);
    }
  });

  // Event listeners
  notifyButton.addEventListener("click", saveThreshold);

  // Fetch gas prices on popup load
  fetchGasPrices();
});
