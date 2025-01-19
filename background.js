function processLastTwoIcons(tab) {
    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id },
            func: getIcons,
        },
        (results) => {
            if (results && results[0]?.result) {
              const iconsData = results[0].result; // Get the array of serialized icon data
              console.log("Last two icons data:", iconsData);
      
              // Process and display the serialized data
              iconsData.forEach((icon, index) => {
                console.log(`Icon ${index + 1} - Align: ${icon.align}, Alt: ${icon.altText}`);
              });
            } else {
              console.error("No matching icons found or failed to execute script.");
            }
          }
        );
    
}


function getIcons() {
    const icons = document.getElementsByClassName("lobby-chat-text-icon");
  
    if (icons.length === 0) {
      return null; // Exit if no icons are found
    }
  
    const lastTwoIcons = [];
  
    // Iterate backwards through the HTMLCollection
    for (let i = icons.length - 1; i >= 0; i--) {
      const icon = icons[i];
      const altText = icon.getAttribute("alt");
  
      // Check if the alt attribute matches the desired dice values
      if (["dice_1", "dice_2", "dice_3", "dice_4", "dice_5", "dice_6"].includes(altText)) {
        // Push a serialized representation of the icon
        lastTwoIcons.push({
          align: icon.getAttribute("align"),
          altText: icon.getAttribute("alt"),
        });
  
        // Break the loop once we have found the last two matches
        if (lastTwoIcons.length === 2) {
          break;
        }
      }
    }
  
    if (lastTwoIcons.length === 0) {
      console.log("No matching dice found.");
      return null;
    }
  
    return lastTwoIcons.reverse(); // Return serialized objects
  }



// Listen for button click in popup.html
chrome.action.onClicked.addListener((tab) => {
    processLastTwoIcons(tab); // Pass the tab object
});
// Listen for a message from the popup to execute the function
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "processLastTwoIcons") {
        // Get the current active tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            
            // Run the function in the active tab
            processLastTwoIcons(tab);
        });
    }
});