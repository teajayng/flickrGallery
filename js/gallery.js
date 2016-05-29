(function(window) {
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
