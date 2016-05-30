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
              refreshDataEl.innerHTML = '<span></span>' + refreshDataElText;

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

          try {
            var searchInput = document.getElementById('username-search'),
            searchSubmit = document.getElementById('username-search--submit'),
            searchHandler = function() {
              var searchInputText = searchInput.value;

              utils.findByUsername({
                username: searchInputText,
                callback: function(res) {
                  try {
                    var data = JSON.parse(res);
                    flickrGallery.userId = data.user.id;
                    if (data.stat !== 'ok') {
                      throw data;
                    } else {
                      utils.getPhotostreamData({
                        userId: data.user.id,
                        callback: function(res) {
                          try {
                            var newPhotos = res.data.photos.photo;
                            while (flickrGallery.container.hasChildNodes()) {
                              flickrGallery.container.removeChild(flickrGallery.container.firstChild);
                            }
                            flickrGallery.generateThumbnailGallery(newPhotos);
                          } catch (e) {
                            throw e;
                          }
                        }
                      });
                    }
                  } catch (e) {
                    console.log(e);
                  }
                }
              });
            };

            searchSubmit.addEventListener('click', searchHandler, false);
            searchInput.addEventListener('keyup', function() {
              var keyCode = event.which || event.keyCode || 0;
              if (keyCode === 13) {
                searchHandler();
                var menuCheckbox = document.getElementById('menu-icon--checkbox');
                menuCheckbox.checked = false;
              }
            }, false);
          } catch (e) {
            container.classList.add('error');
            container.innerHTML = '<h2>Sorry!</h2><p>There was an issue retrieving the username data.</p>';
          }
        } catch (e) {
          container.classList.add('error');
          container.innerHTML = '<h2>Sorry!</h2><p>There was an issue retrieving the photostream data.</p>';
        }
      }
    });
  }

  window.FlickrGallery = utils.extend(window.FlickrGallery || {}, {
    init: init
  });
})(window);

FlickrGallery.init();
