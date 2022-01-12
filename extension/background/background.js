
// Respond to changes in other tabs
browser.runtime.onMessage.addListener(function(message) {
    if (!message || !message.ty) return;
    switch (message.ty) {
        case "rses:pushLocalStorage":
            function pushSettings(tabs) {
                for (let tab of tabs) {
                    browser.tabs.sendMessage(tab.id, {
                        ty: "rses:pushLocalStorage",
                        name: message.name,
                        value: message.value,
                    });
                }
            }
            browser.storage.sync.get().then(storeSettings => {
                if (storeSettings[message.name] != message.value) {
                    browser.storage.sync.set({
                        [message.name]: message.value,
                    });
                    browser.tabs.query({}).then(pushSettings);
                }
            });
            break;
        case "rses:pushAllLocalStorage":
            function pushAllSettings(tabs) {
                for (let tab of tabs) {
                    browser.tabs.sendMessage(tab.id, {
                        ty: "rses:pushAllLocalStorage",
                        all: message.all,
                    });
                }
            }

            browser.tabs.query({}).then(pushAllSettings);
            break;
        default:
            console.log("RsES received message with unknown ty: " + message.ty);
    }
});
