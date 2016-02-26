// create youtube player
var player;
var unshuffledVideoIds = [];
//var videoIds = ["iwYGi7YG4Js", "OQlnsg1jw_o", "yiuYmPDLbk0"];
var videoIds = [];
var youtubeApiKey = "AIzaSyCbNX5WnwPLn30DMaDZlJd0gAYoEqYm1BM";
var playlistWrapper = document.getElementById("playlistWrapper");
var currentPlaylistData = {};
var repeatPlayList = false;
var shufflePlayList = false;
var YToptions = {
  events: {
    'onStateChange': onPlayerStateChange
  }
};
var sortableOptions = {
  handle: '.drag-handler-wrapper',
  placeholder: 'drag-placeholder',
  stop: onPlaylistReorder
}
var currentPlaying = {}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.name == "addToQue") {
    addToQue(request.videoId);
    console.log("request", request);
  }
});


function clone(obj) {
  if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
    return obj;

  if (obj instanceof Date)
    var temp = new obj.constructor(); //or new Date(obj);
  else
    var temp = obj.constructor();

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      obj['isActiveClone'] = null;
      temp[key] = clone(obj[key]);
      delete obj['isActiveClone'];
    }
  }

  return temp;
}

function each(obj, callback) {
  var i = 0;
  if (obj == ("[object Array]" === Object.prototype.toString.apply(obj))) {
    for (; i < obj.length; i++) {
      value = callback.call(obj[i], i, obj[i]);
      if (value === false) {
        break;
      }
    }
  } else {
    for (i in obj) {
      value = callback.call(obj[i], i, obj[i]);
      if (value === false) {
        break;
      }
    }
  }
  return obj;
};


window.onbeforeunload = function() {
  chrome.runtime.sendMessage({
    name: "appClosed"
  });
  return null;
}

function onYouTubePlayerAPIReady() {
  var options = clone(YToptions);
  options.events.onReady = onPlayerReady;
  refreshPlaylist();
  player = new YT.Player('player', options);
}

function getChanelLink(channelId) {
  return ("https://www.youtube.com/channel/" + channelId)
}

function getVideoLink(videoId) {
  return ("https://www.youtube.com/watch?v=" + videoId)
}

function loadVideo(videoId) {
  each(currentPlaylistData.items, function(index, current) {
    if (current.id == videoId) {
      currentPlaying.id = videoId;
      currentPlaying.index = videoIds.indexOf(videoId);
      currentPlaying.title = current.snippet.title;
      currentPlaying.videoUrl = getVideoLink(videoId);
      currentPlaying.channelTitle = current.snippet.channelTitle;
      currentPlaying.channelLink = getChanelLink(current.snippet.channelId);
      return false;
    }
  })
  player.loadVideoById(videoId);
}


function addToQue(videoId) {
  videoIds.push(videoId);
  playlistWrapper.innerHTML = "";
  refreshPlaylist();
  if (videoIds.length == 1) {
    loadVideo(videoId);
  }
}

function getApiUrl(videoIds) {
  return ("https://www.googleapis.com/youtube/v3/videos?id=" + videoIds + "&key=" + youtubeApiKey + "&part=snippet");
}


function refreshPlaylist() {
  var apiUrl = getApiUrl(videoIds.join(","));
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var response = JSON.parse(xhr.responseText);
    currentPlaylistData = response;
    refreshPlaylistView(response.items);
  }
  xhr.open("GET", apiUrl);
  xhr.send();
}


function playNext() {
  if (currentPlaying.id != "") {
    var nextVideoId = videoIds[(currentPlaying.index + 1)];
    if (typeof nextVideoId != "undefined") {
      loadVideo(nextVideoId);
    } else if (repeatPlayList && (currentPlaying.index == (videoIds.length - 1))) {
      var videoId = videoIds[0];
      loadVideo(videoId);
    } else {
      currentPlaying.id = "";
      currentPlaying.index = 0;
    }
  }
}

function refreshPlaylistView(items) {
  items = (typeof items == "undefined") ? currentPlaylistData.items : items;
  playlistWrapper.innerHTML = "";
  each(items, function(index, current) {
    //  console.log("items", index, current);
    appendVideo(current, index);
  })
  addReorderingToPlaylist();
}


function appendVideo(data, index) {
  var indexOrIcon = (currentPlaying.id == data.id) ? "&#9654;" : (parseInt(index) + 1);
  var activeClass = (currentPlaying.id == data.id) ? "active" : "";

  var template = '<div class="playlist-item ' + activeClass + '" data-index="' + videoIds.indexOf(data.id) + '" data-vid="' + data.id + '">\
    <div class="item-number">' + indexOrIcon +
    '</div>\
    <div class="drag-handler-wrapper"><div class="drag-handler"></div></div>\
    <div class="ibacordotcom_youtube_thumb"> \
         <div class="thumb_container">\
         <div class="thumb_wrap">\
           <img src="' +
    data.snippet.thumbnails.default.url + '" width="72">\
        </div>\
        </div>\
    </div>\
  ' + data.snippet.title + '\
  <span class="ibacordotcom-author">\
        ' + data.snippet.channelTitle +
    '\
      </span>\
  </div>';
  playlistWrapper.innerHTML += template;
}


// autoplay video
function onPlayerReady(event) {
  console.log("on player ready");
  event.target.stopVideo();
  loadVideo(videoIds[0])
}

// when video ends
function onPlayerStateChange(event) {
  console.log("playerstateChange", event, event.data)
  if (event.data === -1) {
    onPlaylistReorder();
  }
  if (event.data === 0) {
    playNext();
  }
}

//to initialize sortable on playlist
function addReorderingToPlaylist() {
  if (!$(playlistWrapper).hasClass('ui-sortable')) {
    $(playlistWrapper).sortable(sortableOptions);
  }
}

//stop event of sortable on playlist
function onPlaylistReorder(event, ui) {
  videoIds = $(playlistWrapper).sortable("toArray", {
    attribute: 'data-vid'
  });
  each(videoIds, function(index, current) {
    if (currentPlaying.id == current) {
      currentPlaying.index = parseInt(index);
    }
  });
  reAddIndexesToPlaylist();
  setUpCurrentPlayingDetails();
}

//adding index and current state ot view
function reAddIndexesToPlaylist() {
  $(playlistWrapper).find(">div").removeClass("active").each(function(index, current) {
    var currentVideoId = $(this).attr("data-vid");
    var indexOrIcon = (currentPlaying.id == currentVideoId) ? "&#9654;" : (parseInt(index) + 1);
    var activeClass = (currentPlaying.id == currentVideoId) ? "active" : "";

    //setup index
    $(this).attr("data-index", index);

    //current state
    $(this).addClass(activeClass);
    $(this).find(".item-number").html(indexOrIcon);
  })
}

function setUpCurrentPlayingDetails() {
  //setup video details
  $("#current-playing-name").attr("href", currentPlaying.videoUrl).text(currentPlaying.title);
  //setup chanel details
  $("#channel-name").attr("href", currentPlaying.channelLink).text(currentPlaying.channelTitle);
  //setup video index and total
  $("#video-length-index").text((currentPlaying.index + 1) + "/" + videoIds.length + " videos")
}


function shuffleVideosArray(videoIdsArray) {
  var currentIndex = videoIdsArray.length;
  var temporaryValue;
  var randomIndex;

  //remove the current as it should always come on first index;
  videoIdsArray.splice(videoIdsArray.indexOf(currentPlaying.id), 1)

  // While there remain elements to shuffle
  while (0 !== currentIndex) {
    // Pick a remaining element
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // And swap it with the current element
    temporaryValue = videoIdsArray[currentIndex];
    videoIdsArray[currentIndex] = videoIdsArray[randomIndex];
    videoIdsArray[randomIndex] = temporaryValue;
  }

  //add the current video id on first index;
  videoIdsArray.unshift(currentPlaying.id);

  return videoIdsArray;
}


//binding the click events
document.addEventListener("click", function(event) {
  // retrieve an event if it was called manually
  event = event || window.event;

  // retrieve the related element
  var el = event.target || event.srcElement;

  var classes = el.className.split(" ");

  //binding the click event for playlist items
  if (classes.indexOf("playlist-item") != -1) {

    //get video details
    var videoId = el.getAttribute("data-vid");
    var videoIndex = el.getAttribute("data-index");

    //load the selected video
    if (currentPlaying.id != videoId) loadVideo(videoId);
  }

  //binding the click event for repeat playlist
  if (classes.indexOf("repeat-handler") != -1) {

    //toggle playlist variable
    repeatPlayList = !repeatPlayList;

    //handle classes
    if (repeatPlayList) {
      $(el).addClass("active")
    } else {
      $(el).removeClass("active")
    }

  }

  //binding the click event for shuffle event
  if (classes.indexOf("shuffle-handler") != -1) {

    //toggle playlist variable
    shufflePlayList = !shufflePlayList;

    //handle classes
    if (shufflePlayList) {
      $(el).addClass("active");
      unshuffledVideoIds = videoIds.slice(0);
      videoIds = shuffleVideosArray(videoIds);

    } else {
      $(el).removeClass("active");
      videoIds = unshuffledVideoIds;
    }


    refreshPlaylist();
  }

});
