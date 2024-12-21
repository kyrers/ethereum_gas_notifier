const GAS_PRICES_URL = `https://ethereum-gas-notifier-backend.vercel.app/gasPrices`;

// Notify user if gas price is below the threshold
const notifyUser = (currentAverage, threshold) => {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "../icons/icon128.png",
    title: "Ethereum Gas Alert",
    message: `Average gas price is ${parseFloat(currentAverage).toFixed(
      2
    )} Gwei, below your threshold of ${threshold}!`,
  });
};

// Check gas price against threshold
const checkThreshold = (currentAverage) => {
  chrome.storage.sync.get(["gasThreshold", "notify"], (data) => {
    const { gasThreshold, notify } = data;

    if (gasThreshold && notify && currentAverage <= gasThreshold) {
      notifyUser(currentAverage, gasThreshold);
      chrome.storage.sync.set({ notify: false });
    }
  });
};

// Fetch gas prices
const fetchGasPrices = (callback) => {
  fetch(GAS_PRICES_URL)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const gasPrices = {
          low: data.gasPrices.low,
          average: data.gasPrices.average,
          high: data.gasPrices.high,
        };

        chrome.runtime.sendMessage({ type: "GAS_PRICES_UPDATED", gasPrices });
        callback?.({ success: true, gasPrices });
        checkThreshold(gasPrices.average);
      } else {
        callback?.({ success: false, error: data.message });
      }
    })
    .catch((error) => {
      callback?.({ success: false, error: error.message });
    });
};

// Handle fetch requests
chrome.runtime.onMessage.addListener((message, _, sendResponse) => {
  if (message.type === "FETCH_GAS_PRICES") {
    fetchGasPrices(sendResponse);
    return true;
  }
});

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
