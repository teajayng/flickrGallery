(function(window) {
  'use strict';

  var flickrGallery;

  function init() {
    utils.getPhotostreamData({
      callback: function(res) {
        var container = document.getElementById('thumbnail-gallery');
        container.classList.remove('error');

        try {
          var photos = res.data.photos.photo,
              flickrGallery = new Gallery(photos, container);

          flickrGallery.pages = res.data.photos.pages;
          flickrGallery.generateThumbnailGallery();

          var refreshDataEl = document.getElementById('refresh-data'),
          refreshDataElText = refreshDataEl.textContent,
          refreshData = function() {
            var afterRefresh = function(res) {
              this.container.classList.remove('error');
              refreshDataEl.classList.remove('refreshing');
              refreshDataEl.textContent = refreshDataElText;

              try {
                this.photos = res.data.photos.photo;
                while (this.container.hasChildNodes()) {
                  this.container.removeChild(this.container.firstChild);
                }
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
        } catch (e) {
          container.classList.add('error');
          container.innerHTML = '<h2>Sorry!</h2><p>There was an issue retrieving the data.</p>';
        }
      }
    });
  }

  window.FlickrGallery = utils.extend(window.FlickrGallery || {}, {
    init: init
  });
})(window);

FlickrGallery.init();
