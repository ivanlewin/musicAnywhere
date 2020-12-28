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

/** Looks for the track info on Apple Music
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
 * 
 * @returns {trackInfo}
 */
    const trackInfo = {
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
const psAppleMusic = function() {
        "title": undefined,
        "artists": []
    };

    // Get the primary artist
    let tag = document.querySelector(".web-chrome-playback-lcd__now-playing-container a.web-chrome-playback-lcd__sub-copy-scroll-link:nth-of-type(1)");
    if(tag) {
        let primaryArtist = tag.textContent.trim();
        trackInfo.artists.push(primaryArtist);
    }

    // Get the track title
    tag = document.querySelector(".web-chrome-playback-lcd__now-playing-container .web-chrome-playback-lcd__song-name-scroll-inner-text-wrapper");
    if(tag) {
        let title = tag.textContent.trim();
        trackInfo.title = title;

        // Attempt to extract the featuring artists from the title
        let m = title.match(/ \(feat\. (?<featuring>.*)\)/);
        if(m) {
            let featuringArtists = m.groups.featuring;
            // If there are any featuring artists, push them to the array as well
            if(featuringArtists) {
                featuringArtists = featuringArtists.split(",");
                trackInfo.artists.push(...featuringArtists);
            }
        }
    }
    return trackInfo;
};

/** Looks for the track info on Musixmatch
 * 
 * @returns {trackInfo}
 */
    return itemData;
};

/** Looks for the track info on Spotify
 * 
 * @returns {trackInfo}
 */
const psSpotify = function() {

    const trackInfo = {
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

	trackInfo.artists.push(...artists);
	trackInfo.title = title;

	return trackInfo;
};

// /** Finds info on the current page on Spotify
//  * 
//  * @returns {trackInfo}
//  */
// const cpSpotify = function() {
//     const itemInfo = {
//         "type": undefined,
//         "title": undefined,
//         "artists": [],
//     };

//     // Get the 'Now playing' legend, which contains the title and the artists
// 	let tag = document.querySelector("a[aria-label*='Now playing:']");
// 	if(!tag) return;
// 	let playingTrack = tag.ariaLabel;
// 	let m = playingTrack.match(/Now playing: (?<title>.+) by (?<artists>.+)/);
//     if(!m) return;

//     let artists = m.groups.artists.split(",");
//     let title = m.groups.title;

// 	trackInfo.artists.push(...artists);
// 	trackInfo.title = title;

// 	return trackInfo;
// }

/** Looks for the track info on Youtube
 * 
 * @returns {trackInfo}
 */
const getTrackInfoYoutube = function() {
    const trackInfo = {
        "title": undefined,
        "artists": []
    };

    return trackInfo;
};

/** Looks for the track info on YoutubeMusic
 * 
 * @returns {trackInfo}
 */
const getTrackInfoYoutubeMusic = function() {

    const trackInfo = {
        "title": undefined,
        "artists": []
    };

    // Get the primary artist
    let tag = document.querySelector("div.content-info-wrapper.style-scope span.subtitle yt-formatted-string.ytmusic-player-bar");
    if(tag) {
        let playingTrack = tag.title;
        let primaryArtist = playingTrack.split(" • ")[0];

        trackInfo.artists.push(primaryArtist);
    }

    // Get the track title
    tag = document.querySelector("div.content-info-wrapper.style-scope > yt-formatted-string.title");
    if(tag) {
        let title = tag.textContent;
        trackInfo.title = title
    }


    return trackInfo;
};

/** Looks for the track info using the MediaSession API's metadata
 * 
 * @returns {trackInfo}
 */
const getTrackInfoMediaSession = function() {
    // Check that API is supported
    if(!"mediaSession" in navigator) {
        return;
    }

    const trackInfo = {
        "title": undefined,
        "artists": []
    };

    const metadata = navigator.mediaSession.metadata;
    const title = metadata.title;
    const artistsArray = metadata.artist.split(",");

    trackInfo.title = title;
    trackInfo.artists = artistsArray;

    return trackInfo;
}

/** Returns the appropriate function to query the site
 * 
 * @param site {supportedSite}
 * 
*/
const getTrackInfoOn = function(site) {

    switch(site) {
		case "appleMusic": {
			return getTrackInfoAppleMusic();
		}
		case "genius": {
			return getTrackInfoGenius();
		}
		case "musixmatch": {
			return getTrackInfoMusixmatch();
		}
		case "spotify": {
			return getTrackInfoSpotfiy();
		}
		case "youtube": {
			return getTrackInfoYoutube();
		}
		case "youtubeMusic": {
			return getTrackInfoYoutubeMusic();
		}
		default: {
			return;
		}
	}
}

/** Attempts to search for the track info using the specific function or else tries using the MediaSession API
 * 
 * @param site {supportedSite}
 * @returns {trackInfo}
 */
const getTrackInfo = function() {
    const site = getSite();
    let trackInfo;
    trackInfo = getTrackInfoOn(site);
    if(!trackInfo || !trackInfo.title || !trackInfo.artists.length) {
        trackInfo = getTrackInfoMediaSession();
    }
    return trackInfo;
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