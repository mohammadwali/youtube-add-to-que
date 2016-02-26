// this file is a trigger which just triggers
// background.js to open a our app in a new window
// annd then it closes itself
chrome.runtime.sendMessage({
  name: "launchApp"
});
window.close();
