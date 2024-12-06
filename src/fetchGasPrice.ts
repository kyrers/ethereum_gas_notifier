const ETHERSCAN_API_KEY = "BSEYJEUM2AQ83ZG8FH3EMPUFF7TCYAT84F";
const ETHERSCAN_API_URL = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`;

const fetchGasPrices = async () => {
  try {
    const response = await fetch(ETHERSCAN_API_URL);
    const data = await response.json();

    if (data.status === "1") {
      // Update UI with gas prices
      (document.getElementById("low") as HTMLElement).innerText =
        data.result.SafeGasPrice;
      (document.getElementById("average") as HTMLElement).innerText =
        data.result.ProposeGasPrice;
      (document.getElementById("high") as HTMLElement).innerText =
        data.result.FastGasPrice;
    } else {
      console.error("Error fetching gas prices:", data.message);
      alert("Failed to fetch gas prices. Please try again later.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while fetching gas prices.");
  }
};

// Attach event listener to refresh button
document.addEventListener("DOMContentLoaded", () => {
  fetchGasPrices();

  const refreshButton = document.getElementById("refresh");
  refreshButton?.addEventListener("click", fetchGasPrices);
});
