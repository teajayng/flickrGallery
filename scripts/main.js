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
;(function(window) {
  'use strict';

  function Gallery(photos) {
    var self = this;

    this.currentIndex = 0;
    this.photos = photos;

    this.prev = document.getElementById('lightbox--prev');
    this.next = document.getElementById('lightbox--next');

    this.imageGallery = document.getElementById('lightbox--image-gallery');
    this.imageGallery.style.width = (photos.length * -650).toString() + 'px';
    this.loadedImages = {};

    this.prevImage = null;
    this.currentImage = null;
    this.nextImage = null;

    this.prev.addEventListener('click', function() {
      self.showPrev();
    });

    this.next.addEventListener('click', function() {
      self.showNext();
    });
  }

  Gallery.prototype.showLightbox = function(index) {
    var self = this,
    lightbox = document.getElementById('lightbox'),
    close = document.getElementById('lightbox--close');

    this.currentIndex = index;

    this.addCurrentImage();
    this.addPrevImage();
    this.addNextImage();

    this.imageGallery.style.transform = "translate3d(" + index * -650 + "px, 0, 0)";

    if (this.currentIndex > 0) {
      this.prev.classList.remove('inactive');
    } else {
      this.prev.classList.add('inactive');
    }

    if (this.currentIndex < this.photos.length - 1) {
      this.next.classList.remove('inactive');
    } else {
      this.next.classList.add('inactive');
    }

    close.addEventListener('click', function() {
      lightbox.classList.remove('active');

      // reset lightbox display information
      self.imageGallery.innerHTML = "";
      self.loadedImages = {};
    });

    lightbox.classList.add('active');
  };

  Gallery.prototype.addCurrentImage = function() {
    this.currentImage = this.addImage(this.currentIndex);
  };

  Gallery.prototype.addPrevImage = function() {
    if (this.currentIndex > 0) {
      this.prevImage = this.addImage(this.currentIndex - 1);
    }
  };

  Gallery.prototype.addNextImage = function() {
    if (this.currentIndex < this.photos.length - 1) {
      this.nextImage = this.addImage(this.currentIndex + 1);
    }
  };

  Gallery.prototype.addImage = function(index) {
    if (this.loadedImages[index]) {
      return;
    }

    var li = document.createElement('li'),
    img = document.createElement('img');

    li.dataset.index = index;
    img.src = utils.generateEmbiggenedPhotoUrl(this.photos[index]);
    img.alt = this.photos[index].title;
    img.title = this.photos[index].title;
    li.style.position = "absolute";
    li.style.left = (index * 650).toString() + 'px';

    li.appendChild(img);
    if (index > this.currentIndex) {
      this.imageGallery.appendChild(li);
    } else {
      this.imageGallery.insertBefore(li, this.imageGallery.firstChild);
    }
    this.loadedImages[index] = true;

    return li;
  };

  Gallery.prototype.showPrev = function() {
    if (this.currentIndex > 0) {
      this.currentIndex--;

      if (this.currentIndex === 0) {
        this.prev.classList.add('inactive');
      } else {
        this.addPrevImage();
        this.next.classList.remove('inactive');
      }

      this.imageGallery.style.transform = "translate3d(" + this.currentIndex * -650 + "px, 0, 0)";
    }
  };

  Gallery.prototype.showNext = function() {
    var lastIndex = this.photos.length - 1;
    if (this.currentIndex < lastIndex) {
      this.currentIndex++;

      if (this.currentIndex === lastIndex) {
        this.next.classList.add('inactive');
      } else {
        this.addNextImage();
        this.prev.classList.remove('inactive');
      }

      this.imageGallery.style.transform = "translate3d(" + this.currentIndex * -650 + "px, 0, 0)";
    }
  };

  Gallery.prototype.generateThumbnailGallery = function(el) {
    function eventHandler(index, gallery) {
      return function(event) {
        event.preventDefault();
        gallery.showLightbox(index);
      };
    }

    var data,
    img,
    link,
    listItem;

    for (var i = 0; i < this.photos.length; i++) {
      data = this.photos[i];
      img = document.createElement('img');

      img.src = utils.generateThumbnailUrl(this.photos[i]);
      img.classList.add('thumbnail');
      img.title = this.photos[i].title;
      img.alt = this.photos[i].title;

      link = document.createElement('a');
      link.href = img.src;
      link.addEventListener('click', eventHandler(i, this));
      link.appendChild(img);

      listItem = document.createElement('li');
      listItem.appendChild(link);

      el.appendChild(listItem);
    }
  };

  window.Gallery = Gallery;
})(window);
;(function(window) {
  'use strict';

  var flickrGallery,
      page = 1,
      pages = 1;

  function init() {
    utils.getPhotostreamData({
      callback: function(res) {
        console.log(res);

        if (res && res.data) {
          pages = res.data.photos.pages;

          var photos = res.data.photos.photo,
              container = document.getElementById('thumbnail-gallery'),
              flickrGallery = new Gallery(photos, container);

          flickrGallery.generateThumbnailGallery(container);

          // if (photoset.title && photoset.ownername) {
          //   var header = document.querySelector('.page-wrapper header h1');
          //   header.textContent += " - " + photoset.title;

          //   var subtitle = document.createElement('p');
          //   subtitle.textContent = "photoset by " + photoset.ownername;
          //   document.querySelector('.page-wrapper header').appendChild(subtitle);
          // }
        }
      }
    });
  }

  window.FlickrGallery = utils.extend(window.FlickrGallery || {}, {
    init: init
  });
})(window);

FlickrGallery.init();
