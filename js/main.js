(function(window) {
  'use strict';

  var flickrGallery,
      page = 1,
      pages = 1;

  function init() {
    utils.getPhotostreamData({
      callback: function(res) {
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
