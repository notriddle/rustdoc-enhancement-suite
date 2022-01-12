function updateStoreSettings() {
    var storeSettings = {};

    const checkboxSettings = document.querySelectorAll(".rustdoc-settings input[type='checkbox']");
    for (let checkbox of checkboxSettings) {
      storeSettings[checkbox.id] = checkbox.checked ? 'true' : 'false';
    }
    const selectSettings = document.querySelectorAll(".rustdoc-settings select");
    for (let select of selectSettings) {
      storeSettings[select.id] = select.value;
    }

    browser.storage.sync.set(storeSettings);
    window.postMessage({
        ty: "rses:pullAllLocalStorage",
        all: storeSettings,
    })
}

// Pull current settings
function updateUI() {
    browser.storage.sync.get().then(storeSettings => {
        const checkboxSettings = document.querySelectorAll(".rustdoc-settings input[type='checkbox']");
        for (let checkbox of checkboxSettings) {
            checkbox.addEventListener("change", () => requestAnimationFrame(() => updateStoreSettings()));
            if (storeSettings.hasOwnProperty(checkbox.id)) {
                checkbox.checked = storeSettings[checkbox.id] == 'true';
            }
        }
        const selectSettings = document.querySelectorAll(".rustdoc-settings select");
        for (let select of selectSettings) {
            select.addEventListener("change", () => requestAnimationFrame(() => updateStoreSettings()));
            if (storeSettings.hasOwnProperty(select.id)) {
                for (let option of select.options) {
                    option.selected = option.value == storeSettings[select.id];
                }
            }
        }
    });
}

updateUI();

// Respond to changes in other tabs
browser.runtime.onMessage.addListener(function(message) {
    if (!message || !message.ty) return;
    switch (message.ty) {
        case "rses:pushLocalStorage":
        case "rses:pushAllLocalStorage":
            updateUI();
            break;
        default:
            console.log("RsES received message with unknown ty: " + message.ty);
    }
});
