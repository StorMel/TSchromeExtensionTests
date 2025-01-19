
chrome.runtime.onInstalled.addListener(({ reason }) => {
    chrome.action.setBadgeText({
        text: "OFF",
    });
    if (reason === "install") {
        chrome.storage.local.set({
            apiSuggestions: ["tabs", "storage", "scripting","notifications"],
            
        });
    }

});
chrome.action.onClicked.addListener(async (tab) => {
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    const nextState = prevState === "ON" ? "OFF" : "ON";

    await chrome.action.setBadgeText({
        tabId: tab.id,
        text: nextState,
    });
    
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: createStorageElement,
      //args: [nextState.text], 
  });
    // Execute the script in the current tab
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: Changes,
        args: [tab]  
    });

  
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.greeting === "getTabId") {
        chrome.action.getBadgeText({ tabId: sender.tab.id }).then(sendResponse);
    }
    if (message.greeting === "displayNotification") {
      const { name1, name2 } = message;
      createNotification(name1, name2);
      sendResponse({ status: "Notification displayed" });
  }
  if (message.greeting === "runDiceChecker") {
      tab=message.tabVal
      chrome.action.getBadgeText({ tabId: sender.tab.id }).then((result) => {
        // Use badgeText later to send a message or perform other actions
        if (result === "ON") {
            chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: processLastTwoIcons  
            });
        } 
        // Send the response back
        sendResponse({ status: result });
    });
}
    return true;
});
function Changes(tab){
  const chat= document.getElementsByClassName("game_chat_text_div")
  const mu= new MutationObserver ((observer) => {

        //console.log(observer)
        chrome.runtime.sendMessage(
          { greeting: "runDiceChecker",
            tabVal: tab
          },
          (response) => { //how do i tell if the function is off and want to end the loop
            if (response.status==="OFF"){
              mu.disconnect();
            }

          }
      );
  
    });
    mu.observe(chat[0],{childList: true});//[0] is what i actually need
    
}
function processLastTwoIcons() {
    const storageElement = document.getElementById("lastIconLocationStorage");
    const lastIconLocation = parseInt(storageElement.dataset.lastIconLocation, 10);
    const icons = document.getElementsByClassName("lobby-chat-text-icon");
    let change=false
    const lastTwoIcons = [];

    if (icons.length === 0) {
      return null; 
    }

    // Iterate backwards through the HTMLCollection
    for (let i = icons.length - 1; i >= lastIconLocation; i--) {

      const icon = icons[i];
      const altText = icon.getAttribute("alt");
  
      if (["dice_1", "dice_2", "dice_3", "dice_4", "dice_5", "dice_6"].includes(altText))   {

        if (lastIconLocation<i && !change){
          storageElement.dataset.lastIconLocation = i.toString();
          change=true
        }
        //const url = `https://colonist.io${icon.getAttribute("src")}`;
        //const cleanUrl = url.split('.svg')[0] + '.svg';
        lastTwoIcons.push({
          //src: cleanUrl,
          altText: icon.getAttribute("alt"),
        });
  
        if (lastTwoIcons.length === 2) {
            //console.log(`image: ${lastTwoIcons[0].src} , dice: ${lastTwoIcons[0].altText}`)
            //return lastTwoIcons.reverse();
            chrome.runtime.sendMessage({ 
              greeting: "displayNotification", 
              name1: lastTwoIcons[0].altText, 
              name2: lastTwoIcons[1].altText 
          }, (response) => {
              console.log("Notification triggered with names:", response);
          });
        }
      }
    }

   console.log("No matching dice found. or the data has already been displayed");
      //return null;


}
function createNotification(name1,name2) {
    chrome.notifications.create(
        {
            type: "basic",
            iconUrl: "alarm.jpg",//icon,
            title: "dice rolled!",
            message: `rolled ${name1} and ${name2}` ,
            silent: true
        });
}
function createStorageElement() {//creating an element to store data
    let storageElement = document.getElementById("lastIconLocationStorage");
    if (!storageElement) {
        storageElement = document.createElement("div");
        storageElement.id = "lastIconLocationStorage";
        storageElement.style.display = "none"; // Hide the element
        storageElement.dataset.lastIconLocation = "0"; // Initialize with 0
        document.body.appendChild(storageElement);
    }
}
  


