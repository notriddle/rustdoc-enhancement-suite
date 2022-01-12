(function() {
    // The rustdoc vars div is used to communicate between Rust and JS,
    // and also used by docs.rs. If it does not exist, this isn't
    // a new enough rustdoc version.
    var el = document.getElementById("rustdoc-vars");
    if (!el) return;

    // Hook localStorage, so that our settings change from inside the page.
    //
    // NOTE: this runs in page context. To keep things from breaking,
    // we filter the variables on the other side to only ones we know
    // about. Think very carefully before adding more logic here.
    //
    // Also, this is copied from
    // https://github.com/rust-lang/rust/blob/72e74d7b9cf1a7901650227e74650f1fcc797600/src/librustdoc/html/static/js/storage.js
    var sc = document.createElement("script");
    sc.innerHTML = "window.updateLocalStorage = function(name, value) {" +
    "  try {" +
    "    window.postMessage({ty: 'rses:pushLocalStorage', name: name, value: value});" +
    "    window.localStorage.setItem(name, value);" +
    "  } catch(e) {}" +
    "};" +
    // https://github.com/rust-lang/rust/blob/72e74d7b9cf1a7901650227e74650f1fcc797600/src/librustdoc/html/static/js/settings.js#L5
    "window.addEventListener('message', function(event) {" +
    "  if (event.source == window &&" +
    "      event.data &&" +
    "      event.data.ty == 'rses:pullLocalStorage') {" +
    "    window.localStorage.setItem(event.data.name, event.data.value);" +
    "    if (event.data.name == 'rustdoc-theme') {" +
    "      switchTheme(window.currentTheme, window.mainTheme, event.data.value, true);" +
    "    } else if (event.data.name == 'rustdoc-preferred-dark-theme' || event.data.name == 'rustdoc-preferred-light-theme' || event.data.name == 'rustdoc-use-system-theme') {" +
    "      window.updateSystemTheme();" +
    "    }" +
    "  }" +
    "});";
    document.documentElement.appendChild(sc);

    // Respond to settings changes in this tab
    window.addEventListener('message', function(event) {
      if (event.source == window &&
          event.data &&
          event.data.ty == 'rses:pushLocalStorage') {
        switch (event.data.name) {
            case "rustdoc-theme":
            case "rustdoc-preferred-dark-theme":
            case "rustdoc-preferred-light-theme":
            case "rustdoc-use-system-theme":
            case "rustdoc-auto-hide-large-items":
            case "rustdoc-auto-hide-method-docs":
            case "rustdoc-auto-hide-trait-implementations":
            case "rustdoc-go-to-only-result":
            case "rustdoc-line-numbers":
            case "rustdoc-disable-shortcuts":
                var name = event.data.name.toString();
                var value = event.data.value.toString();
                chrome.runtime.sendMessage({
                    ty: "rses:pushLocalStorage",
                    name: name,
                    value: value,
                });

                break;
        }
      }
    });

    // Respond to changes in other tabs
    chrome.runtime.onMessage.addListener(function(message) {
        if (!message || !message.ty) return;
        switch (message.ty) {
            case "rses:pushLocalStorage":
                window.postMessage({
                    ty: "rses:pullLocalStorage",
                    name: message.name,
                    value: message.value,
                })
                break;
            case "rses:pushAllLocalStorage":
                for (let name in message.all) {
                    let value = message.all[name];
                    window.postMessage({
                        ty: "rses:pullLocalStorage",
                        name: name,
                        value: value,
                    })
                }
                break;
            default:
                console.log("RsES received message with unknown ty: " + message.ty);
        }
    });

    // Inject current settings
    var list = [
        "rustdoc-theme",
        "rustdoc-preferred-dark-theme",
        "rustdoc-preferred-light-theme",
        "rustdoc-use-system-theme",
        "rustdoc-auto-hide-large-items",
        "rustdoc-auto-hide-method-docs",
        "rustdoc-auto-hide-trait-implementations",
        "rustdoc-go-to-only-result",
        "rustdoc-disable-shortcuts",
        "rustdoc-line-numbers",
    ];
    chrome.storage.sync.get(storeSettings => {
      for (let name of list) {
        if (storeSettings && storeSettings.hasOwnProperty(name)) {
            window.postMessage({
                ty: "rses:pullLocalStorage",
                name: name,
                value: storeSettings[name],
            })
        }
      }
    });
})();
