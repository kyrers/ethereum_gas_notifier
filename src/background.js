const ETHERSCAN_API_KEY = "BSEYJEUM2AQ83ZG8FH3EMPUFF7TCYAT84F";
const ETHERSCAN_API_URL = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`;

// Handle fetch requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_GAS_PRICES") {
    fetchGasPrices(sendResponse);
    return true; // Keep channel open
  }
});

// Fetch gas prices
const fetchGasPrices = (callback) => {
  fetch(ETHERSCAN_API_URL)
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "1") {
        const gasPrices = {
          low: data.result.SafeGasPrice,
          average: data.result.ProposeGasPrice,
          high: data.result.FastGasPrice,
        };
        callback?.({ success: true, gasPrices });
        checkThreshold(gasPrices.average); // Check threshold if available
      } else {
        callback?.({ success: false, error: data.message });
      }
    })
    .catch((error) => {
      callback?.({ success: false, error: error.message });
    });
};

// Check gas price against threshold
const checkThreshold = (currentAverage) => {
  chrome.storage.sync.get(["gasThreshold", "notify"], (data) => {
    const { gasThreshold: threshold, notify } = data;

    if (threshold && notify && currentAverage <= threshold) {
      notifyUser(currentAverage, threshold);

      // Update the flag to prevent repeated notifications
      chrome.storage.sync.set({ notify: false });
    }
  });
};

// Notify user if gas price is below the threshold
const notifyUser = (currentAverage, threshold) => {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "../icons/icon128.png",
    title: "Ethereum Gas Alert",
    message: `Average gas price is ${currentAverage} Gwei, below your threshold of ${threshold} Gwei!`,
  });
};

// Set up alarms
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("checkGasPrices", { periodInMinutes: 0.5 });
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create("checkGasPrices", { periodInMinutes: 0.5 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkGasPrices") {
    fetchGasPrices();
  }
});
