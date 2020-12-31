# musicAnywhere

This is the source code for **musicAnywhere**, a [chrome extension](https://support.google.com/chrome_webstore/answer/2664769) to connect music streaming and lyrics with one another.


### Primary features
* Change streaming sites
  * E.g. take the song you're listening to on Spotify and press a button to search for it on another Apple Music
* Search for lyrics
  * You can search for song, album or an artist's lyrics from a streaming site
* Open the current page on the desktop version of the site (only works with Spotify and Apple Music)


### Currently supported sites
( Some features of the extension might work on any site, but they should work fine on these sites. )
* Streaming sites
  * [Apple Music](https://music.apple.com/)
  * [Spotify](https://open.spotify.com/)
  * [YouTube](https://www.youtube.com/)
  * [YouTube Music](https://music.youtube.com/)
* Lyrics sites
  * [Genius](https://www.genius.com/)
  * [Musixmatch](https://www.musixmatch.com/)


### How it works
When you click on the extension you will see a dropdown menu with two options: **Current Page** and **Playing Song**. Those are the 'source' for analyzing the site and get the media you want. The **Current Page** option should will only on the supported streaming sites; The **Playing Song** option will probably work on a lot more sites (that is, sites where you are playing music that has *metadata* available through the [MediaSession API](https://developer.mozilla.org/en-US/docs/Web/API/Media_Session_API))

Let's say you're on Spotify listening to Bohemian Rhapsody by Queen, and want to search for the song on YouTube Music. You would select the **Playing Song** option, and then click on the *Search on YouTube Music* button.

Or let's say you're on Genius looking at the artist page of Kendrick Lamar. You would have to select **Current Page** since there's no music playing, and then click the button of your choice.

Also there're some site-specific functions like **Open in desktop version**. If you're on Spotify or Apple Music, and the **Current Page** option is selected, you should see a button that, when clicked, opens the current page on the desktop app of the site (which you should have previously installed for it to work).

### How to install
As of 2020 it's not on the Chrome Web Store, so you have to clone this repo and load the *unpacked* extension
See [here](https://developer.chrome.com/docs/extensions/mv3/getstarted/#manifest) how to