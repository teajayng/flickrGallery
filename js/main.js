(function(window) {
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
          console.log(e);
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
      var afterRefresh = function(res) {
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
          this.container.classList.add('error');
          this.container.innerHTML = '<h2>Sorry!</h2><p>There was an issue retrieving the data.</p>';
        }
      };
      afterRefresh = afterRefresh.bind(this);

      refreshDataEl.classList.add('refreshing');
      refreshDataEl.textContent = 'refreshing...';

      utils.getPhotostreamData({
        refreshData: true,
        callback: afterRefresh
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
