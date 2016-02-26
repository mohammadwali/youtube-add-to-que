var LSHelper = new localStorageHelper(true);

var isAppLaunched = false;
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.name == "launchApp") {
      launchApp()
    }
    if (request.name == "appClosed") {
      console.log("appClosed");
      isAppLaunched = false;
    }

  });

//listen for content script
//when content script start connection
chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(request) {
    if (request.name == "addToQue") {
      if (!isAppLaunched) {
        launchApp(function() {
          chrome.runtime.sendMessage(request);

        })
      } else {
        chrome.runtime.sendMessage(request);

      }
    }
  });
});




function launchApp(callback) {

  // a && (localStorage.video_url = a);

  chrome.windows.create({
    url: chrome.extension.getURL("app.html"),
    type: "panel",
    width: 1250,
    height: 503
  }, function(tab) {

    console.log("arguments", arguments);
    isAppLaunched = true;
    if (typeof callback == "function") callback(tab);
  })
}
