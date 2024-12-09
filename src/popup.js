document.addEventListener("DOMContentLoaded", () => {
  const low = document.getElementById("low");
  const average = document.getElementById("average");
  const high = document.getElementById("high");

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

  fetchGasPrices();
});
