(function(window, undefined, factory) {

  // create a port to send and recive
  // message with background app
  var port = chrome.runtime.connect();

  // // send an initial message to background
  // // that content script is injected
  // port.postMessage({
  //   injected: true
  // });

  // //listener to recive messages from background
  // port.onMessage.addListener(function(response) {
  //   if (response.init) factory(window, undefined, port)
  // });

  factory(window, undefined, port);
})(window, undefined, function(window, undefined, port) {
  var $ = ($ || window.jQuery || {});
  var body = $(document.body);
  var url_page = window.location + "";

  body.addClass("yq-injected")

  //listener to recive messages from background
  port.onMessage.addListener(function(response) {
    if (response.name == "") {

    }
  });



  $(document).ready(function() {
    setup_youtube()
    body.click(function() {
      setTimeout(function() {
        if (!body.hasClass("yq-injected")) setup_youtube()
      }, 1500)
    })
  })


  function setup_youtube() {
    var a = !1;
    if (-1 < url_page.indexOf("miniplayer=1")) a = !0;
    else if (-1 < url_page.indexOf("feature=player_embedded")) {
      var b = document.referrer;
      0 < b.indexOf("ytimg.com") ? a = !0 : 0 < b.indexOf("youtube.com/embed/") ? a = !0 : 0 < b.indexOf("youtube.com/v/") && (a = !0)
    }
    //if (a) return youtube_playmini(), !1;
    // a = chrome.extension.getURL("/app/cs_yt.css");
    // $('<link rel="stylesheet" type="text/css" href="' + a + '" >')
    //   .appendTo("head");
    watch_detail();
    after_watchlater();
    // playlist_sidebar();
    // add_to_playlist_page();
    // setup_yt_hover();
    body.addClass("yq-injected")
  }

  function after_watchlater() {
    var template = '<button type="button" class="addto-button video-actions spf-nolink yt-uix-button yt-uix-button-default yt-uix-button-short yt-uix-tooltip" title="Play With YouTube Que" data-video-ids="_l9IdwJQ7l4" role="button" data-tooltip-text="Play With YouTube Que" style="margin-right:25px;padding: 5px;height: 22px;"><span style="display:block;margin-top: -3px;" class="yt-uix-button-content"><img src="' + chrome.extension.getURL("/img/16x16.png") + '" alt="Play With YouTube Que" title="Play With YouTube Que" /></span></button>';

    var generatedElement = $(template);

    generatedElement.click(function(e) {
      e.preventDefault();
      var anchor = $(this).parent("div").find("a:has(.video-thumb)");
      var link = anchor.attr("href");
      var videoId = link.split("?v=")[1];
    //  console.log("link", link, videoId, anchro);
      port.postMessage({
        name: "addToQue",
        videoId: videoId
      });
    });
    $(".addto-watch-later-button, .addto-watch-later-button-sign-in")
      .before(generatedElement)
  }


  function watch_detail() {
    var a = '<button type="button" class="addto-button video-actions spf-nolink yt-uix-button yt-uix-button-default yt-uix-button-short yt-uix-tooltip" title="Play With YouTube Que" data-video-ids="_l9IdwJQ7l4" role="button" data-tooltip-text="Play With YouTube Que" style="margin-right:25px;padding: 5px;height: 22px;"><span style="display:block;margin-top: -3px;" class="yt-uix-button-content"><img src="' + chrome.extension.getURL("/img/16x16.png") + '" alt="Play With YouTube Que" title="Play With YouTube Que" /></span></button>',
      a = $(a);
    a.click(function() {
      mbtn_clicked(location + "", !0);
      return !1
    });
    $("#watch-like-dislike-buttons")
      .after(a)
  }

  function add_to_playlist_page() {
    var a = '<a href="#" class="yt-uix-button yt-uix-button-default" style="margin-left:5px;"><img src="' + chrome.extension.getURL("/img/16x16.png") + '" alt="Play in MiniPlayer" title="Play in MiniPlayer" /> <span class="yt-uix-button-content">Play in MiniPlayer</span></a>',
      a = $(a);
    a.click(function() {
      mbtn_play_url(location + "");
      return !1
    });
    $(".playlist-actions .playlist-play-all")
      .after(a)
  }


  function mbtn_clicked(a, b) {
    if (!find_yt_id(a)) return console.log("Can't find youtube ID."), !1;
    mbtn_play_url(a, b)
  }


});
