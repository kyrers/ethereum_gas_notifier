document.addEventListener("DOMContentLoaded", () => {
  const low = document.getElementById("low");
  const average = document.getElementById("average");
  const high = document.getElementById("high");
  const thresholdInput = document.getElementById("thresholdInput");
  const saveButton = document.getElementById("save");
  const message = document.getElementById("message");

  // Fetch gas prices and update the UI
  const fetchGasPrices = () => {
    chrome.runtime.sendMessage({ type: "FETCH_GAS_PRICES" }, (response) => {
      if (response && response.success) {
        low.innerText = response.gasPrices.low;
        average.innerText = response.gasPrices.average;
        high.innerText = response.gasPrices.high;
      } else {
        console.error("Error fetching gas prices:", response.error);
        alert("Failed to fetch gas prices. Please try again later.");
      }
    });
  };

  // Save threshold to chrome.storage.sync
  const saveThreshold = () => {
    const thresholdValue = parseFloat(thresholdInput.value);
    if (isNaN(thresholdValue) || thresholdValue <= 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    chrome.storage.sync.set({ gasThreshold: thresholdValue }, () => {
      message.innerText = `Threshold saved: ${thresholdValue} Gwei`;
      message.classList.remove("hidden");
      setTimeout(() => message.classList.add("hidden"), 3000); // Hide message after 3 seconds
    });
  };

  // Load the saved threshold when the popup opens
  chrome.storage.sync.get("gasThreshold", (data) => {
    if (data.gasThreshold) {
      thresholdInput.value = data.gasThreshold;
    }
  });

  // Event listeners
  saveButton.addEventListener("click", saveThreshold);

  // Fetch gas prices on popup load
  fetchGasPrices();
});
