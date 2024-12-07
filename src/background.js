const ETHERSCAN_API_KEY = "BSEYJEUM2AQ83ZG8FH3EMPUFF7TCYAT84F";
const ETHERSCAN_API_URL = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${ETHERSCAN_API_KEY}`;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_GAS_PRICES") {
    fetch(ETHERSCAN_API_URL)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "1") {
          sendResponse({
            success: true,
            gasPrices: {
              low: data.result.SafeGasPrice,
              average: data.result.ProposeGasPrice,
              high: data.result.FastGasPrice,
            },
          });
        } else {
          sendResponse({ success: false, error: data.message });
        }
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }
});
