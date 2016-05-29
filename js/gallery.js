(function(window) {
  'use strict';

  function Gallery(photos) {
    var self = this;

    this.currentIndex = 0;
    this.currentImage = null;
    this.photos = photos;
    this.loadedImages = {};

    this.imageWidth = Math.min(utils.calculateViewportWidth(), 650);

    this.prev = document.getElementById('lightbox--prev');
    this.next = document.getElementById('lightbox--next');
    this.imageGallery = document.getElementById('lightbox--image-gallery');

    this.prev.addEventListener('click', function() {
      self.showPrev();
    });

    this.next.addEventListener('click', function() {
      self.showNext();
    });
  }

  Gallery.prototype.showLightbox = function(index) {
    var self = this,
    lightbox = document.getElementById('lightbox');

    this.currentIndex = index;

    this.addCurrentImage();
    this.addPrevImage();
    this.addNextImage();
    this.setTitle(this.currentImage.dataset.title);

    this.imageGallery.style.width = (this.photos.length * this.imageWidth).toString() + 'px';
    this.imageGallery.style.transform = "translate3d(" + index * -this.imageWidth + "px, 0, 0)";
    this.imageGallery.style.transition = "all .4s ease";

    window.addEventListener('resize', utils.debounce(function() {
      self.recalculateLightbox(index);
    }, 250));

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

    this.attachCloseEvents(lightbox);

    lightbox.classList.add('active');
  };

  Gallery.prototype.recalculateLightbox = function(index) {
    this.imageWidth = Math.min(utils.calculateViewportWidth(), 650);

    this.imageGallery.style.width = (this.photos.length * this.imageWidth).toString() + 'px';
    this.imageGallery.style.transform = "translate3d(" + index * -this.imageWidth + "px, 0, 0)";
    this.imageGallery.style.transition = null;

    var images = this.imageGallery.querySelectorAll('li');
    for (var i = 0; i < images.length - 1; i++) {
      var li = images[i];
      li.style.left = (li.dataset.index * this.imageWidth).toString() + 'px';
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
    console.log(this.currentImage);
    this.setTitle(this.currentImage.dataset.title);
    this.imageGallery.style.transform = "translate3d(" + this.currentIndex * -this.imageWidth + "px, 0, 0)";
    this.imageGallery.style.transition = "all .4s ease";
  };

  Gallery.prototype.setTitle = function(text) {
    var p = document.getElementById('lightbox--image-title');
    p.textContent = text;
  };

  Gallery.prototype.attachCloseEvents = function(lightbox) {
    var self = this,
        close = document.getElementById('lightbox--close'),
        overlay = document.getElementById('lightbox--overlay');

    close.addEventListener('click', function() {
      lightbox.classList.remove('active');

      // reset lightbox display information
      self.imageGallery.innerHTML = "";
      self.loadedImages = {};
    });

    overlay.addEventListener('click', function() {
      lightbox.classList.remove('active');

      // reset lightbox display information
      self.imageGallery.innerHTML = "";
      self.loadedImages = {};
    });
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
