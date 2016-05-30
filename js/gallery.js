(function(window) {
  'use strict';

  var userId = '44738776@N00';

  function Gallery(photos, container) {
    this.photos = photos;
    this.container = container;

    this.currentIndex = 0;
    this.currentImage = null;
    this.loadedImages = {};

    this.page = 1;
    this.pages = 1;

    this.imageWidth = 0;
    this.setImageWidth();

    this.initElements();
    this.rebindHandlers();
  }

  Gallery.prototype.initElements = function() {
    this.prev = document.getElementById('lightbox--prev');
    this.next = document.getElementById('lightbox--next');
    this.close = document.getElementById('lightbox--close');
    this.overlay = document.getElementById('lightbox--overlay');
    this.lightbox = document.getElementById('lightbox');
    this.imageGallery = document.getElementById('lightbox--image-gallery');
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

  Gallery.prototype.showLightbox = function(index) {
    var self = this;

    this.currentIndex = index;

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
    if (utils.calculateViewportWidth() <= 736) {
      this.imageWidth = 320;
    } else {
      this.imageWidth = 650;
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
    img.src = utils.generateEmbiggenedPhotoUrl(this.photos[index]);
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
  };

  Gallery.prototype.setTitle = function(text) {
    var p = document.getElementById('lightbox--image-title');
    p.textContent = text;
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
    this.loadedImages = {};
  };

  Gallery.prototype.setImageWidth = function() {
    if (utils.calculateViewportWidth() <= 736) {
      this.imageWidth = 320;
    } else {
      this.imageWidth = 650;
    }
  };

  Gallery.prototype.generateThumbnailGallery = function(photos) {
    photos = typeof photos !== 'undefined' ? photos : this.photos;

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

    for (var i = 0; i < photos.length; i++) {
      data = photos[i];
      img = document.createElement('img');

      img.src = utils.generateThumbnailUrl(photos[i]);
      img.classList.add('thumbnail');
      img.title = photos[i].title;
      img.alt = photos[i].title;

      link = document.createElement('a');
      link.href = img.src;
      link.addEventListener('click', eventHandler(i, this));
      link.appendChild(img);

      listItem = document.createElement('li');
      listItem.appendChild(link);

      this.container.appendChild(listItem);
    }
  };

  Gallery.prototype.getNextPage = function(page) {
    var afterGettingNextPage = this.afterGettingNextPage.bind(this);

    if (typeof page === 'undefined') {
      if (this.page < this.pages) {
        page = this.page++;
      }
    }

    utils.getPhotostreamData({
      page: page,
      callback: afterGettingNextPage
    });
  };

  Gallery.prototype.getNextPageAndAddImage = function() {
    this.page++;
    var afterGettingNextPage = this.afterGettingNextPage.bind(this);

    utils.getPhotostreamData({
      page: this.page,
      callback: afterGettingNextPage
    });
  };

  Gallery.prototype.afterGettingNextPage = function(res) {
    try {
      var photos = res.data.photos.photo;
      this.generateThumbnailGallery(photos);

      // update stored image data
      this.photos = this.photos.concat(photos);
      this.addNextImage();
    } catch (e) {
      // handle errors
    }
  };

  window.Gallery = Gallery;
})(window);
