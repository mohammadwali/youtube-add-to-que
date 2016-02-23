(function(window, undefined, factory) {

  // create a port to send and recive
  // message with background app
  var port = chrome.runtime.connect();

  // send an initial message to background
  // that content script is injected
  port.postMessage({
    injected: true
  });

  //listener to recive messages from background
  port.onMessage.addListener(function(response) {
    if (response.init) factory(window, undefined, port)
  });


})(window, undefined, function(window, undefined, port) {
  var $ = ($ || window.jQuery || {});
  var playlist = {
    que: [{
      id: "fdfdffd"
    }, {
      id: "fdfdffd23"
    }],
    current: {
      id: "fdfdffd23"
    }
  };

  //listener to recive messages from background
  port.onMessage.addListener(function(response) {
    if (response.name == "") {

    }
  });


  // this function will work when app is not initialized
  function play() {

  }


  // to add the video to playlist
  function playNext() {

  }


});
