(function(window) {
  'use strict';

  var apiKey = '6569236893a124291e840668242de95b',
  // userId = '44738776@N00'; // default value, username teajayng
  userId = '91612334@N05'; // default value, username mistahchen10

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
      xhr = new XMLHttpRequest();
    } else {
      // not going to implement the fallbacks at this time
      // because support is good enough
      // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
      return;
    }

    xhr.onreadystatechange = function() {
      if (this.readyState < XMLHttpRequest.DONE) {
        return;
      }

      if (this.status !== 200) {
        throw "Status code was not a 200";
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

  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this,
      args = arguments;

      clearTimeout(timeout);
      timeout = setTimeout(function() {
        timeout = null;
        if (!immediate) {
          func.apply(context, args);
        }
      }, wait);
      if (immediate && !timeout) {
        func.apply(context, args);
      }
    };
  }

  function calculateViewportWidth() {
    return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  }

  function isScrolledToBottom() {
    var scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop,
    scrollHeight = (document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight;

    return (scrollTop + window.innerHeight) >= scrollHeight;
  }

  function clearChildrenElements(el) {
    if (el) {
      while (el.hasChildNodes()) {
        el.removeChild(el.firstChild);
      }
    }
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
      // console.log(e);
      return false;
    }
  }

  function noop() {
    // this is a noop!
  }

  function getPhotostreamData(opts) {
    var options = extend({
      userId: userId,
      page: 1,
      context: window,
      callback: noop,
      refreshData: false
    }, opts);

    if (!testForLocalStorage()) {
      // local storage unavailable, make GET request
      getFreshPhotostreamData(false, options);
    } else {
      var key = 'flickr-' + options.userId + '-' + options.page,
      lsData = localStorage.getItem(key);

      if (lsData && !options.refreshData) {
        lsData = JSON.parse(lsData);

        var timestamp = lsData.timestamp,
        now = new Date().getTime();

        if (timestamp + 36000000 < now) {
          getFreshPhotostreamData(true, options);
        } else {
          if (options.callback && typeof options.callback === "function") {
            options.callback.call(options.context, lsData);
          }
        }
      } else {
        // nothing stored in ls, make GET request
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
        user_id: options.userId,
        page: options.page,
        per_page: 25,
        format: 'json',
        nojsoncallback: 1
      },
      callback: function(res) {
        var parsedData = JSON.parse(res),
        lsData = {
          data: parsedData,
          timestamp: new Date().getTime()
        };
        if (lsAvailable) {
          var key = 'flickr-' + options.userId + '-' + options.page;
          localStorage.removeItem(key);
          localStorage.setItem(key, JSON.stringify(lsData));
        }
        if (options.callback && typeof options.callback === "function") {
          options.callback.call(options.context, lsData);
        }
      }
    });
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

  function findByUsername(opts) {
    var options = extend({
      username: 'teajayng',
      context: window,
      callback: noop
    }, opts);

    utils.get({
      url: 'https://api.flickr.com/services/rest/',
      data: {
        method: 'flickr.people.findByUsername',
        api_key: apiKey,
        username: options.username,
        format: 'json',
        nojsoncallback: 1
      },
      callback: function(res) {
        if (options.callback && typeof options.callback === "function") {
          options.callback.call(options.context, res);
        }
      }
    });
  }

  function getExif(opts) {
    var options = extend({
      photo_id: '0',
      context: window,
      callback: noop
    }, opts);

    utils.get({
      url: 'https://api.flickr.com/services/rest/',
      data: {
        method: 'flickr.photos.getExif',
        api_key: apiKey,
        photo_id: options.photo_id,
        format: 'json',
        nojsoncallback: 1
      },
      callback: function(res) {
        if (options.callback && typeof options.callback === "function") {
          options.callback.call(options.context, res);
        }
      }
    });
  }


  window.utils = extend(window.utils || {}, {
    extend: extend,
    getQueryParam: getQueryParam,
    get: get,
    debounce: debounce,
    calculateViewportWidth: calculateViewportWidth,
    isScrolledToBottom: isScrolledToBottom,
    clearChildrenElements: clearChildrenElements,

    getPhotostreamData: getPhotostreamData,
    generateThumbnailUrl: generateThumbnailUrl,
    generatePhotoUrl: generatePhotoUrl,
    generateEmbiggenedPhotoUrl: generateEmbiggenedPhotoUrl,

    findByUsername: findByUsername,
    getExif: getExif
  });
})(window);
;(function(window) {
  'use strict';

  function Gallery(photos, container) {
    this.photos = photos;
    this.container = container;

    this.userId = '91612334@N05'; // default to mistahchen10 for init

    this.currentIndex = 0;
    this.currentImage = null;
    this.lightboxVisible = false;
    this.loadedImages = {};

    this.page = 1;
    this.pages = 1;

    this.imageWidth = 0;
    this.setImageWidth();

    this.initElements();
    this.rebindHandlers();
    this.initUsernameSearch();
    this.initThumbnailGalleryClickHandler();
  }

  Gallery.prototype.initElements = function() {
    this.prev = document.getElementById('lightbox--prev');
    this.next = document.getElementById('lightbox--next');
    this.close = document.getElementById('lightbox--close');
    this.overlay = document.getElementById('lightbox--overlay');
    this.lightbox = document.getElementById('lightbox');
    this.imageGallery = document.getElementById('lightbox--image-gallery');
    this.searchInput = document.getElementById('username-search');
    this.searchSubmit = document.getElementById('username-search--submit');
  };

  Gallery.prototype.rebindHandlers = function() {
    this.keyupHandler = this.keyupHandler.bind(this);
    this.resizeHandler = this.resizeHandler.bind(this);
    this.hideAndResetLightbox = this.hideAndResetLightbox.bind(this);
    this.showPrev = this.showPrev.bind(this);
    this.showNext = this.showNext.bind(this);

    var scrollHandler = utils.debounce(function() {
      if (utils.isScrolledToBottom()) {
        this.getNextPage();
      }
    }, 300);
    scrollHandler = scrollHandler.bind(this);
    window.addEventListener('scroll', scrollHandler, false);
  };

  Gallery.prototype.initThumbnailGalleryClickHandler = function() {
    var self = this;
    this.container.addEventListener('click', function(event) {
      var listItem = event.target,
      index = parseInt(listItem.dataset.index);

      if (index !== index) {
        return; // index is NaN
      }
      self.showLightbox(index);
    }, false);
  };

  Gallery.prototype.showLightbox = function(index) {
    this.currentIndex = index;
    this.lightboxVisible = true;

    this.addCurrentImage();
    this.addPrevImage();
    this.addNextImage();
    this.setTitle(this.currentImage.dataset.title);

    this.imageGallery.style.width = (this.photos.length * this.imageWidth).toString() + 'px';
    this.imageGallery.style.transform = 'translate3d(' + index * -this.imageWidth + 'px, 0, 0)';
    this.imageGallery.style.transition = 'all .4s ease';

    if (this.currentIndex > 0) {
      this.prev.classList.remove('inactive');
    } else {
      this.prev.classList.add('inactive');
    }

    if (this.currentIndex < this.photos.length - 1 || this.page < this.pages) {
      this.next.classList.remove('inactive');
    } else {
      this.next.classList.add('inactive');
    }

    this.attachEvents();

    this.lightbox.classList.add('active');
  };

  Gallery.prototype.recalculateLightbox = function(index) {
    var viewportWidth = utils.calculateViewportWidth();
    if (viewportWidth <= 736) {
      this.imageWidth = 320;
    } else if (viewportWidth <= 1024) {
      this.imageWidth = 650;
    } else {
      this.imageWidth = 1024;
    }

    this.imageGallery.style.width = (this.photos.length * this.imageWidth).toString() + 'px';
    this.imageGallery.style.transform = 'translate3d(' + index * -this.imageWidth + 'px, 0, 0)';
    this.imageGallery.style.transition = null;

    var images = this.imageGallery.children;
    for (var i = 0; i < images.length; i++) {
      var li = images[i],
      newPos = parseInt(li.dataset.index) * this.imageWidth;
      li.style.left = newPos.toString() + 'px';
    }
  };

  Gallery.prototype.addCurrentImage = function() {
    this.currentImage = this.addImage(this.currentIndex);
    this.showExif();
  };

  Gallery.prototype.addPrevImage = function() {
    if (this.currentIndex > 0) {
      this.addImage(this.currentIndex - 1);
    }
  };

  Gallery.prototype.addNextImage = function() {
    if (this.currentIndex < this.photos.length - 1) {
      this.addImage(this.currentIndex + 1);
    } else {
      if (this.page < this.pages) {
        this.getNextPageAndAddImage();
      }
    }
  };

  Gallery.prototype.addImage = function(index) {
    if (this.loadedImages[index]) {
      return;
    }

    var li = document.createElement('li'),
    img = document.createElement('img');

    li.dataset.index = index;

    if (screen.width < 414) {
      img.src = utils.generatePhotoUrl(this.photos[index]);
    } else {
      img.src = utils.generateEmbiggenedPhotoUrl(this.photos[index]);
    }

    img.alt = this.photos[index].title;
    img.title = this.photos[index].title;
    li.style.position = 'absolute';
    li.style.left = (index * this.imageWidth).toString() + 'px';
    li.dataset.title = this.photos[index].title;

    li.appendChild(img);
    if (index > this.currentIndex) {
      this.imageGallery.appendChild(li);
    } else {
      this.imageGallery.insertBefore(li, this.imageGallery.firstChild);
    }
    this.loadedImages[index] = li;

    return li;
  };

  Gallery.prototype.showPrev = function() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.currentImage = this.loadedImages[this.currentIndex];

      if (this.currentIndex === 0) {
        this.prev.classList.add('inactive');
      } else {
        this.addPrevImage();
        this.next.classList.remove('inactive');
      }

      this.afterShowNewImage();
    }
  };

  Gallery.prototype.showNext = function() {
    var lastIndex = this.photos.length - 1;
    if (this.currentIndex < lastIndex) {
      this.currentIndex++;
      this.currentImage = this.loadedImages[this.currentIndex];

      if (this.currentIndex === lastIndex) {
        this.next.classList.add('inactive');
      } else {
        this.addNextImage();
        this.prev.classList.remove('inactive');
      }

      this.afterShowNewImage();
    }
  };

  Gallery.prototype.afterShowNewImage = function() {
    this.setTitle(this.currentImage.dataset.title);
    this.imageGallery.style.transform = 'translate3d(' + this.currentIndex * -this.imageWidth + 'px, 0, 0)';
    this.imageGallery.style.transition = 'all .4s ease';
    this.showExif();
  };

  Gallery.prototype.setTitle = function(text) {
    var p = document.getElementById('lightbox--image-title');
    p.textContent = text;

    var exifButton = document.createElement('button');
    exifButton.textContent = "Show EXIF";
    exifButton.onclick = function() {
      var imageMask = document.getElementById('lightbox--image-mask');
      if (this.textContent === "Show EXIF") {
        imageMask.classList.add('exif--show');
        this.textContent = "Hide EXIF";
      } else {
        imageMask.classList.remove('exif--show');
        this.textContent = "Show EXIF";
      }
    };
    p.appendChild(exifButton);
  };

  Gallery.prototype.keyupHandler = function() {
    var keyCode = event.which || event.keyCode || 0;
    switch (keyCode) {
      case 27:
        this.hideAndResetLightbox();
        break;
      case 37:
        this.showPrev();
        break;
      case 39:
        this.showNext();
        break;
      default:
        break;
    }
  };

  Gallery.prototype.resizeHandler = utils.debounce(function() {
    this.recalculateLightbox(this.currentIndex);
  }, 250);

  Gallery.prototype.attachEvents = function() {
    this.prev.addEventListener('click', this.showPrev, false);
    this.next.addEventListener('click', this.showNext, false);
    this.close.addEventListener('click', this.hideAndResetLightbox, false);
    this.overlay.addEventListener('click', this.hideAndResetLightbox, false);
    window.addEventListener('keyup', this.keyupHandler, false);
    window.addEventListener('resize', this.resizeHandler, false);
  };

  Gallery.prototype.removeEvents = function() {
    this.prev.removeEventListener('click', this.showPrev);
    this.next.removeEventListener('click', this.showNext);
    this.close.removeEventListener('click', this.closeHandler);
    this.overlay.removeEventListener('click', this.closeHandler);
    window.removeEventListener('keyup', this.eventHandler);
    window.removeEventListener('resize', this.resizeHandler);
  };

  Gallery.prototype.hideAndResetLightbox = function() {
    this.lightbox.classList.remove('active');

    // reset lightbox display information
    this.imageGallery.innerHTML = '';
    this.currentIndex = 0;
    this.currentImage = null;
    this.lightboxVisible = false;
    this.loadedImages = {};
  };

  Gallery.prototype.setImageWidth = function() {
    var viewportWidth = utils.calculateViewportWidth();
    if (viewportWidth <= 736) {
      this.imageWidth = 320;
    } else if (viewportWidth <= 1024) {
      this.imageWidth = 650;
    } else {
      this.imageWidth = 1024;
    }
  };

  Gallery.prototype.generateThumbnailGallery = function() {
    var lastImageOnloadHandler = function() {
      if (utils.isScrolledToBottom()) {
        this.getNextPage();
      }
    };
    lastImageOnloadHandler = lastImageOnloadHandler.bind(this);

    var data,
    img,
    link,
    listItem;

    utils.clearChildrenElements(this.container);

    for (var i = 0; i < this.photos.length; i++) {
      data = this.photos[i];
      img = document.createElement('img');

      img.src = utils.generateThumbnailUrl(this.photos[i]);
      img.classList.add('thumbnail', 'loading');
      img.title = this.photos[i].title;
      img.alt = this.photos[i].title;
      img.dataset.index = i;

      listItem = document.createElement('li');
      listItem.appendChild(img);

      this.container.appendChild(listItem);

      if (i === this.photos.length - 1) {
        img.onload = lastImageOnloadHandler;
      }
    }
  };

  Gallery.prototype.getNextPage = function(page) {
    this.page++;
    page = typeof page !== 'undefined' ? page : this.page;

    if (page < this.pages) {
      var options = {
        userId: this.userId,
        page: page,
        context: this,
        callback: this.afterGettingNextPage
      };

      utils.getPhotostreamData(options);
    }
  };

  Gallery.prototype.getNextPageAndAddImage = function() {
    this.page++;

    var options = {
      userId: this.userId,
      page: this.page,
      context: this,
      callback: this.afterGettingNextPage
    };

    utils.getPhotostreamData(options);
  };

  Gallery.prototype.afterGettingNextPage = function(res) {
    try {
      var photos = res.data.photos.photo;
      this.photos = this.photos.concat(photos);
      this.generateThumbnailGallery();

      if (this.lightboxVisible) {
        this.addNextImage();
      }
    } catch (e) {
      // console.log(e);
    }
  };

  Gallery.prototype.initUsernameSearch = function() {
    var searchHandler = function() {
      try {
        var searchInputText = this.searchInput.value;

        utils.findByUsername({
          username: searchInputText,
          context: this,
          callback: function(res) {
            try {
              var data = JSON.parse(res);
              if (data.stat !== 'ok') {
                throw data;
              } else {
                this.userId = data.user.id;
                var h1 = document.querySelector('header h1');
                h1.innerHTML = data.user.username._content + '&rsquo;s photostream';

                utils.getPhotostreamData({
                  userId: data.user.id,
                  context: this,
                  callback: function(res) {
                    try {
                      var newPhotos = res.data.photos.photo;
                      utils.clearChildrenElements(this.container);
                      this.photos = newPhotos;
                      this.generateThumbnailGallery(newPhotos);
                    } catch (e) {
                      throw e;
                    }
                  }
                });
              }
            } catch (e) {
              // console.log(e);
            }
          }
        });
      } catch (e) {
        // console.log(e);
        this.container.classList.add('error');
        this.container.innerHTML = '<h2>Sorry!</h2><p>There was an issue retrieving the username data.</p>';
      }
    };

    searchHandler = searchHandler.bind(this);
    this.searchSubmit.addEventListener('click', searchHandler, false);
    this.searchInput.addEventListener('keyup', function() {
      var keyCode = event.which || event.keyCode || 0;
      if (keyCode === 13) {
        searchHandler();
        var menuCheckbox = document.getElementById('menu-icon--checkbox');
        menuCheckbox.checked = false;
      }
    }, false);
  };

  Gallery.prototype.showExif = function() {
    var currentImageData = this.photos[this.currentIndex];
    utils.getExif({
      photo_id: currentImageData.id,
      context: this,
      callback: function(res) {
        try {
          var data = JSON.parse(res),
          imageMask = document.getElementById('lightbox--image-mask');

          if (data.stat === "ok") {
            var camera = data.photo.camera ? data.photo.camera : '',
            exif = data.photo.exif ? data.photo.exif : [],
            exifHash = {};

            for (var i = 0; i < exif.length; i++) {
              exifHash[exif[i].tag] = exif[i].raw._content;
            }


            var cameraInfo = document.getElementById('exif--camera-info');
            if (!cameraInfo) {
              cameraInfo = document.createElement('ul');
              cameraInfo.id = 'exif--camera-info';
            }
            cameraInfo.innerHTML = '<li><strong>Camera</strong><span>' + camera + '</span></li>' +
              '<li><strong>Lens</strong><span>' + exifHash.LensModel + '</span></li>';
            imageMask.appendChild(cameraInfo);

            var shootingInfo = document.getElementById('exif--shooting-info');
            if (!shootingInfo) {
              shootingInfo = document.createElement('ul');
              shootingInfo.id = 'exif--shooting-info';
            }
            shootingInfo.innerHTML = '<li><strong>Apeture</strong><span><em>f</em>/' + exifHash.FNumber + '</span></li>' +
              '<li><strong>Exposure Time</strong><span>' + exifHash.ExposureTime + '</span></li>' +
              '<li><strong>Focal Length</strong><span>' + exifHash.FocalLength + '</span></li>' +
              '<li><strong>ISO</strong><span>' + exifHash.ISO + '</span></li>';
            imageMask.appendChild(shootingInfo);
          }
        } catch (e) {
          // console.log(e);
        }
      }
    });
  };

  window.Gallery = Gallery;
})(window);
;(function(window) {
  'use strict';

  var flickrGallery;
  var devMode = false;

  function init() {
    devMode = !!utils.getQueryParam('dev');

    if (devMode) {
      document.getElementById('refresh-data').classList.add('dev-mode');
    }

    utils.getPhotostreamData({
      callback: function(res) {
        var container = document.getElementById('thumbnail-gallery');
        container.classList.remove('error');

        try {
          var photos = res.data.photos.photo,
              flickrGallery = new Gallery(photos, container);

          flickrGallery.pages = res.data.photos.pages;
          flickrGallery.generateThumbnailGallery();

          if (devMode) {
            initializeDevMode(flickrGallery);
          }
        } catch (e) {
          // console.log(e);
          container.classList.add('error');
          container.innerHTML = '<h2>Sorry!</h2><p>There was an issue retrieving the photostream data.</p>';
        }
      }
    });
  }

  // this adds a "refresh data" button to force fetch new photostream data
  // photostream data is otherwise pulled from localstorage if it's there
  //
  // this button displays pretty terribly on mobile devices
  function initializeDevMode(flickrGallery) {
    var refreshDataEl = document.getElementById('refresh-data'),
    refreshDataElText = refreshDataEl.textContent,
    refreshData = function() {
      refreshDataEl.classList.add('refreshing');
      refreshDataEl.textContent = 'refreshing...';

      utils.getPhotostreamData({
        refreshData: true,
        context: this,
        callback: function(res) {
          this.container.classList.remove('error');
          refreshDataEl.classList.remove('refreshing');
          refreshDataEl.innerHTML = '<span></span>' + refreshDataElText;

          try {
            this.photos = res.data.photos.photo;
            utils.clearChildrenElements(this.container);
            this.generateThumbnailGallery();

            if (this.page > 1) {
              for (var i = 2; i <= this.page; i++) {
                this.getNextPage(i);
              }
            }
          } catch (e) {
            // console.log(e);
            this.container.classList.add('error');
            this.container.innerHTML = '<h2>Sorry!</h2><p>There was an issue retrieving the data.</p>';
          }
        }
      });
    };

    refreshData = refreshData.bind(flickrGallery);
    refreshDataEl.addEventListener('click', refreshData, false);
  }

  window.FlickrGallery = utils.extend(window.FlickrGallery || {}, {
    init: init
  });
})(window);

FlickrGallery.init();
