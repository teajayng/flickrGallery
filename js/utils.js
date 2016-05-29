(function(window) {
  'use strict';

  var apiKey = '6569236893a124291e840668242de95b',
      photosetId = '72157664867464591',
      userId = '44738776@N00';

  function extend(object) {
    for (var i = 1; i < arguments.length; i++) {
      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) {
          object[key] = arguments[i][key];
        }
      }
    }

    return object;
  }

  function getQueryParam(key) {
    var queryString = window.location.search.substring(1),
        queryStringArray = queryString.split("&");

    for (var i = 0; i < queryStringArray.length; i++) {
      var data = queryStringArray[i].split("=");
      if (data[0] == key){
        return data[1];
      }
    }

    return false;
  }

  function get(opts) {
    // a very basic ajax wrapper with very little error checking and handling
    var options = opts || {},
        xhr;

    if (typeof options.url !== 'string') {
      options.url = '';
    }

    if (typeof options.data !== 'object') {
      options.data = {};
    }

    if (typeof options.callback !== 'function') {
      options.callback = noop();
    }

    if (typeof XMLHttpRequest !== 'undefined') {
      // we could probably do without this check since it's fairly well
      // supported in modern browsers
      xhr = new XMLHttpRequest();
    }

    xhr.onreadystatechange = function() {
      if (this.readyState < XMLHttpRequest.DONE) {
        return;
      }

      if (this.status !== 200) {
        if (window.console) {
          console.log('Error', xhr);
        }
      }

      if (this.readyState === XMLHttpRequest.DONE) {
        options.callback(this.response);
      }
    };

    var queryParams = [];
    for (var key in options.data) {
      if (options.data.hasOwnProperty(key)) {
        queryParams.push(encodeURIComponent(key) + '=' + encodeURIComponent(options.data[key]));
      }
    }

    var url = options.url + (queryParams.length ? '?' + queryParams.join('&') : '');
    xhr.open('GET', url, true);
    xhr.send('');
  }

  function noop() {
    // this is a noop!
  }

  function getPhotostreamData(opts) {
    var options = extend({
      // photosetId: photosetId,
      userId: userId,
      callback: noop
    }, opts);

    if (!testForLocalStorage()) {
      // local storage unavailable, make GET request
      console.log("data coming from flickr");
      getFreshPhotostreamData(false, options);
    } else {
      var key = 'flickr-' + options.userId,
          lsData = localStorage.getItem('flickr-' + options.userId);

      if (lsData) {
        lsData = JSON.parse(lsData);

        var timestamp = lsData.timestamp,
            now = new Date().getTime();

        if (timestamp + 36000000 < now) {
          console.log("data coming from flickr");
          getFreshPhotostreamData(true, options);
        } else {
          if (options.callback && typeof options.callback === "function") {
            console.log("data coming from localstorage");
            options.callback.call(window, lsData);
          }
        }
      } else {
        // nothing stored in ls, make GET request
        console.log("data coming from flickr");
        getFreshPhotostreamData(true, options);
      }
    }
  }

  function getFreshPhotostreamData(lsAvailable, options) {
    utils.get({
      url: 'https://api.flickr.com/services/rest/',
      data: {
        method: 'flickr.people.getPublicPhotos',
        api_key: apiKey,
        // photoset_id: options.photosetId,
        user_id: options.userId,
        format: 'json',
        nojsoncallback: 1
      },
      callback: function(res) {
        var lsData = {
              data: JSON.parse(res),
              timestamp: new Date().getTime()
            };
        if (lsAvailable) {
          var key = 'flickr-' + options.userId;
          localStorage.removeItem(key);
          localStorage.setItem(key, JSON.stringify(lsData));
        }
        if (options.callback && typeof options.callback === "function") {
          options.callback.call(window, lsData);
        }
      }
    });
  }


  function testForLocalStorage() {
    if (getQueryParam('ls') === "0") {
      return false;
    }

    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }

  function generateBaseUrl(photo) {
    return 'https://farm' + photo.farm + '.staticflickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret;
  }

  function generateThumbnailUrl(photo) {
    return generateBaseUrl(photo) + '_q.jpg';
  }

  function generatePhotoUrl(photo) {
    return generateBaseUrl(photo) + '.jpg';
  }

  function generateEmbiggenedPhotoUrl(photo) {
    return generateBaseUrl(photo) + '_b.jpg';
  }

  window.utils = extend(window.utils || {}, {
    extend: extend,
    getQueryParam: getQueryParam,
    get: get,
    noop: noop,

    getPhotostreamData: getPhotostreamData,
    generateThumbnailUrl: generateThumbnailUrl,
    generatePhotoUrl: generatePhotoUrl,
    generateEmbiggenedPhotoUrl: generateEmbiggenedPhotoUrl
  });
})(window);
