
// Respond to changes in other tabs
chrome.runtime.onMessage.addListener(function(message) {
    if (!message || !message.ty) return;
    switch (message.ty) {
        case "rses:pushLocalStorage":
            function pushSettings(tabs) {
                for (let tab of tabs) {
                    chrome.tabs.sendMessage(tab.id, {
                        ty: "rses:pushLocalStorage",
                        name: message.name,
                        value: message.value,
                    });
                }
            }
            chrome.storage.sync.get(storeSettings => {
                if (storeSettings[message.name] != message.value) {
                    chrome.storage.sync.set({
                        [message.name]: message.value,
                    });
                    chrome.tabs.query({}, pushSettings);
                }
            });
            break;
        case "rses:pushAllLocalStorage":
            function pushAllSettings(tabs) {
                for (let tab of tabs) {
                    chrome.tabs.sendMessage(tab.id, {
                        ty: "rses:pushAllLocalStorage",
                        all: message.all,
                    });
                }
            }

            chrome.tabs.query({}).then(pushAllSettings);
            break;
        default:
            console.log("RsES received message with unknown ty: " + message.ty);
    }
});
