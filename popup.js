// popup.js
document.getElementById("logDiceButton").addEventListener("click", () => {
    // Send a message to the background script when the button is clicked
    chrome.runtime.sendMessage({ action: "processLastTwoIcons" });
});