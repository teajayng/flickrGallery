# flickr gallery

To run locally:

    npm install
    grunt

This is not necessary; the node server is just there so this can run on heroku. You can just load `index.html` in the browser.

There is a 'dev mode' available that displays a button that will force fetch fresh data from flickr. This is activated by including a `dev=1` query param. There is also a query param `ls=0` that will force the test for localstorage to fail.

CSS is formatted using the Concentric philosophy: [http://rhodesmill.org/brandon/2011/concentric-css/](http://rhodesmill.org/brandon/2011/concentric-css/)

This code exercise can also be seen at [https://guarded-river-97756.herokuapp.com/](https://guarded-river-97756.herokuapp.com/)

One note is that I would normally squash the commits on my feature branch into one commit before making a pull request:

	git rebase -i HEAD~n


### Future features & improvements
* make lightbox responsive instead of adaptive
* social sharing
* support swipe-based lightbox navigation on mobile
* masonry layout for thumbnail gallery
* sorting and filtering
* improve backwards compatibility
	* flexbox is supported IE11+	
	* Element.classList is supported IE10+
	* HTMLElement.dataset is supported IE11+
* improve error handling and UI feedback