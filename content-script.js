"use strict";

/**
 * @typedef {Object} itemData
 * @property {"song" | "album" | "artist"} type - The item type
 * @property {string} title - The song or album title or the artist name
 * @property {Array} artists - An array containing the song or album artist(s). Empty if type == artist
 */

/**
 * @typedef {"appleMusic" | "genius" | "musixmatch" | "spotify" | "youtube" | "youtubeMusic"} supportedSite
 */


/** Gets the site name based on the URL hostname
 * 
 * @returns {supportedSite}
 * 
*/
const getSiteName = function() {

    const hostname = new URL(window.location.href).hostname;
    
    const sites = [
        {name: "appleMusic", hostname: "music.apple.com"},
        {name: "genius", hostname: "genius.com"},
        {name: "musixmatch", hostname: "www.musixmatch.com"},
        {name: "spotify", hostname: "open.spotify.com"},
        {name: "youtube", hostname: "www.youtube.com"},
        {name: "youtubeMusic", hostname: "music.youtube.com"}
    ]
    
    const siteName = sites.filter(s => s.hostname === hostname)[0].name;

    return siteName;
};

/** Finds the metadata of the song currently playing
 * 
 * @returns {itemData}
 */
const getDataPlayingSong = function() {
    // return psMediaSession();
    let itemData;

    const siteName = getSiteName();
    switch(siteName) {
		case "appleMusic": {
            itemData = psAppleMusic();
            break;
		}
		case "spotify": {
            itemData = psSpotify();
            break;
		}
		case "youtube": {
            itemData = psYouTube();
            break;
		}
		case "youtubeMusic": {
            itemData = psYouTubeMusic();
            break;
		}
    }
    
    if(!itemData || !itemData.title || !itemData.artists.length) {
        itemData = psMediaSession();
    }
    return itemData;
}

/** Finds the metadata of the current page item (it can be a song, album or artist)
 * 
 * @returns {itemData}
 */
const getDataCurrentPage = function() {

    const siteName = getSiteName();    
    switch(siteName) {
		case "appleMusic": {
			return cpAppleMusic();
		}
		case "genius": {
			return cpGenius();
		}
		case "musixmatch": {
			return cpMusixmatch();
		}
		case "spotify": {
			return cpSpotify();
		}
		case "youtube": {
			return cpYouTube();
		}
		case "youtubeMusic": {
			return cpYouTubeMusic();
		}
		default: {
			return;
		}
    }
}

/** If on Spotify or Apple Music, returns a link to open the current page on the desktop version of the site
 * 
 * @returns {string | undefined} desktopURI
 */
const getDesktopURI = function() {
    const siteName = getSiteName();
    switch(siteName) {
		case "appleMusic": {
			return dURIAppleMusic();
		}
		case "spotify": {
			return dURISpotify();
		}
		default: {
			return;
		}
	}
}

///// Playing Song /////

/** Site-specific function for finding the metadata on a song playing on Apple Music
 * 
 * @returns {itemData}
 */
const psAppleMusic = function() {
    const itemData = {
        "type": "song",
        "title": undefined,
        "artists": []
    };

    // Get the primary artist
    let tag = document.querySelector(".web-chrome-playback-lcd__now-playing-container a.web-chrome-playback-lcd__sub-copy-scroll-link:nth-of-type(1)");
    if(tag) {
        let primaryArtist = tag.textContent.trim();
        itemData.artists.push(primaryArtist);
    }

    // Get the track title
    tag = document.querySelector(".web-chrome-playback-lcd__now-playing-container .web-chrome-playback-lcd__song-name-scroll-inner-text-wrapper");
    if(tag) {
        let title = tag.textContent.trim();
        itemData.title = title;

        // Attempt to extract the featuring artists from the title
        let m = title.match(/ \(feat\. (?<featuring>.*)\)/);
        if(m) {
            let featuringArtists = m.groups.featuring;
            // If there are any featuring artists, push them to the array as well
            if(featuringArtists) {
                featuringArtists = featuringArtists.split(",");
                itemData.artists.push(...featuringArtists);
            }
        }
    }
    return itemData;
};

/** Site-specific function for finding the metadata on a song playing on Spotify
 * 
 * @returns {itemData}
 */
const psSpotify = function() {

    const itemData = {
        "type": "song",
        "title": undefined,
        "artists": []
    };

    // Get the 'Now playing' legend, which contains the title and the artists
	let tag = document.querySelector("a[aria-label*='Now playing:']");
	if(!tag) return;
	let playingTrack = tag.ariaLabel;
	let m = playingTrack.match(/Now playing: (?<title>.+) by (?<artists>.+)/);
    if(!m) return;

    let artists = m.groups.artists.split(",");
    let title = m.groups.title;

	itemData.artists.push(...artists);
	itemData.title = title;

	return itemData;
};

/** Site-specific function for finding the metadata on a song playing on YouTube
 * 
 * @returns {itemData}
 */
const psYouTube = function() {
    const itemData = {
        "type": "song",
        "title": undefined,
        "artists": []
    };

    return itemData;
};

/** Site-specific function for finding the metadata on a song playing on YouTubeMusic
 * 
 * @returns {itemData}
 */
const psYouTubeMusic = function() {

    const itemData = {
        "type": "song",
        "title": undefined,
        "artists": []
    };

    // Get the primary artist
    let tag = document.querySelector("div.content-info-wrapper.style-scope span.subtitle yt-formatted-string.ytmusic-player-bar");
    if(tag) {
        let playingTrack = tag.title;
        let primaryArtist = playingTrack.split(" • ")[0];

        itemData.artists.push(primaryArtist);
    }

    // Get the track title
    tag = document.querySelector("div.content-info-wrapper.style-scope > yt-formatted-string.title");
    if(tag) {
        let title = tag.textContent;
        itemData.title = title
    }


    return itemData;
};

/** Function for finding the metadata on the playing song using the MediaSession API
 * 
 * @returns {itemData}
 */
const psMediaSession = function() {
    // Check that API is supported
    if(!"mediaSession" in navigator) {
        return;
    }

    const itemData = {
        "type": "song",
        "title": undefined,
        "artists": []
    };

    const metadata = navigator.mediaSession.metadata;
    const title = metadata.title;
    const artistsArray = metadata.artist.split(",");

    itemData.title = title;
    itemData.artists = artistsArray;

    return itemData;
}

/** Returns the appropriate function to scrape the site for the playing song
 * 
 * @param site {supportedSite}
 * 
*/
const getPSFunc = function(site) {

    switch(site) {
		case "appleMusic": {
			return psAppleMusic();
		}
		case "spotify": {
			return psSpotify();
		}
		case "youtube": {
			return psYouTube();
		}
		case "youtubeMusic": {
			return psYouTubeMusic();
		}
		default: {
			return psMediaSession();
		}
	}
}




///// Current page /////

/** Extracts data from the current page on Apple Music
 * 
 * * Only album and artist pages supported
 * @returns {itemData}
 */
const getTrackInfo = function() {
    const site = getSite();
    let trackInfo;
    trackInfo = getTrackInfoOn(site);
    if(!trackInfo || !trackInfo.title || !trackInfo.artists.length) {
        trackInfo = getTrackInfoMediaSession();
const cpAppleMusic = function() {

    // Checks that user's on an album or artist page based on the URL, and gets the type
    const m = window.location.href.match(/music\.apple\.com\/(?:\w{2}\/)?(?<type>album|artist)/);
    if(!m) return
    const type = m.groups.type;

    const itemData = {
        type,
        "title": undefined,
        "artists": []
    };

    // The title is an <h1> tag on both album and artist pages
    const titleTag = document.querySelector("h1");
    if(titleTag) {
        itemData.title = titleTag.textContent.trim();
    }

    if(type === "album") {
        // Get the primary artist
        const artistTag = document.querySelector("h2 a");
        if(artistTag) {
            itemData.artists.push(artistTag.textContent.trim());
        }
    }

	return itemData;
}

/** Gets the site's name based on the URL hostname
 * 
 * @returns {supportedSite}
 * 



};

/** Gets a URI that opens the current playing track on the desktop version of Spotify
 * 
 * @returns {string} desktopURI
 */
const getDesktopURISpotify = function() {
    let tag = document.querySelector("a[aria-label*='Now playing:']");
    if(!tag) return;
    let url = tag.getAttribute("href"); // To prevent the browser from appending the base URL

    const desktopURI = `spotify:/${url}`;
    return desktopURI;
}

/** Gets a URI that opens the current playing track on the desktop version of Apple Music
 * 
 * @returns {string} desktopURI
 */
const getDesktopURIAppleMusic = function () {
    const tag = document.querySelector(".web-chrome-playback-lcd__now-playing-container a.web-chrome-playback-lcd__sub-copy-scroll-link:nth-last-of-type(1)");
    if(!tag) return;
    const url = tag.href;

    // replacing the http(s) protocol with itmss opens the URI on Apple Music or iTunes Desktop (Windows)
    const desktopURI = url.replace(/(https|http)/, "itmss");
    return desktopURI;
}

const getDesktopURI = function() {
    const site = getSite();
    switch(site) {
		case "appleMusic": {
			return getDesktopURIAppleMusic();
		}
		case "spotify": {
			return getDesktopURISpotify();
		}
		default: {
			return;
		}
	}
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        try {
            if(request.function === "getSite") {
                const site = getSite();
                sendResponse({ site });
            } else if(request.function === "getTrackInfo") {
                const trackInfo = getTrackInfo();
                sendResponse(trackInfo);
            } else if(request.function === "getDesktopURI") {
                const desktopURI = getDesktopURI();
                sendResponse({ desktopURI });
            }
        } catch (e) {
            console.error(e);
        }
    }
);