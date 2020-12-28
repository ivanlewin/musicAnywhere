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

/** Extracts data from the current page on Genius
 * 
 * @returns {itemData}
 */
const cpGenius = function() {

    let type;
    // Determine if the current page is an album, artist or song page based on the URL
    const m = window.location.href.match(/genius\.com\/(?<type>album|artist)/);
    if(m) {
        type = m.groups.type
    }
    else if(window.location.href.endsWith("-lyrics")) {
        type = "song"
    }
    
    const itemData = {
        type,
        "title": undefined,
        "artists": []
    };

    if(type === "artist") {
        const titleTag = document.querySelector("h1");
        if(titleTag) {
            // Only gets the textContent of the <h1>, excluding the children span
            itemData.title = titleTag.childNodes[0].textContent.trim();
        }
    } else if(type === "album") {
        const titleTag = document.querySelector("h1[class*='primary_info-title']");
        if(titleTag) {
            itemData.title = titleTag.textContent.trim();
        }
        const artistTag = document.querySelector("a[class*='primary_artist']");
        if(artistTag) {
            itemData.artists.push(artistTag.textContent.trim());
        }
    } else if(type === "song") {
        // Get the primary artist
        const primaryArtistTag = document.querySelector("a[class*='primary_artist']");
        if(primaryArtistTag) {
            const primaryArtist = primaryArtistTag.textContent.trim();
            itemData.artists.push(primaryArtist);
        }
        // Get the featuring artists
        const featuringArtistsTags = document.querySelectorAll("expandable-list[label='Featuring'] span[ng-repeat*='artist in collection'] a");
        if(featuringArtistsTags) {
            const tagArray = Array.from(featuringArtistsTags); // Make an array from the NodeList
            let featuringArtists = tagArray.map(tag => tag.textContent.trim()); // Extract the names
            itemData.artists.push(...featuringArtists);
        }

        // Get the track title
        const titleTag = document.querySelector("h1[class*='primary_info-title']");
        if(titleTag) {
            itemData.title = titleTag.textContent.trim();
        }
    }

    return itemData;
};

/** Extracts data from the current page on Musixmatch
 * 
 * @returns {itemData}
 */
const cpMusixmatch = function() {

    // Determine if the current page is an album, artist or song page based on the URL
    const m = window.location.href.match(/musixmatch\.com\/(?<type>lyrics|artist|album)/);
    if(!m) {
        return
    }
    const type = m.groups.type === "lyrics" ? "song" : m.groups.type; // if URL is /lyrics, it's a song

    const itemData = {
        type,
        "title": undefined,
        "artists": []
    };

    if(type === "artist") {
        const titleTag = document.querySelector(".profile-info h1");
        if(titleTag) {
            itemData.title = titleTag.textContent.trim();
        }
    } else if(type === "album") {
        const titleTag = document.querySelector("h1");
        if(titleTag) {
            itemData.title = titleTag.textContent.trim();
        }
        const artistTag = document.querySelector("h2 a[href*='/artist']");
        if(artistTag) {
            itemData.artists.push(artistTag.textContent.trim());
        }
    } else if(type === "song") {
        // Get the <title> tag, which contains the title and the artists
        const titleTag = document.querySelector("title");
        if(!titleTag) return;
        const m = titleTag.textContent.match(/(?<artists>.+) - (?<title>.+) Lyrics \| Musixmatch/);
        if(!m) return;

        // Separate into primary and featuring artists
        let [primaryArtist, featuringArtists] = m.groups.artists.split(" feat. ");
        itemData.artists.push(primaryArtist);
        // If there are any featuring artists, push them to the array as well
        if(featuringArtists) {
            featuringArtists = featuringArtists.split(",");
            itemData.artists.push(...featuringArtists);
        }

        itemData.title = m.groups.title;
    }

    return itemData;
};

/** Extracts data from the current page on Spotify
 * 
 * * Only album and artist pages supported
 * @returns {itemData}
 */
const cpSpotify = function() {

    // Checks that user's on an album or artist page based on the URL, and gets the type
    const m = window.location.href.match(/spotify\.com\/(?<type>album|artist)/);
    if(!m) return
    const type = m.groups.type;

    const itemData = {
        type,
        "title": undefined,
        "artists": [],
    };

    // Get title
    const titleTag = document.querySelector("main h1");
    if(titleTag) {
        itemData.title = titleTag.textContent.trim();
    }

    if(type === "album") {
        // Get the primary artist
        const artistTag = document.querySelector("main a[href*='/artist']");
        if(artistTag) {
            itemData.artists.push(artistTag.textContent.trim());
        }
    }

	return itemData;
}

/** Extracts data from the current page on YouTube
 * 
 * * Only album and artist pages supported
 * @returns {itemData}
 */
const cpYouTube = function() {

    // // Checks what type of page the user is on based on the URL, and gets the type
    // const m = window.location.href.match(/music\.youtube\.com\/(?<type>playlist|channel|watch|browse)/);
    // if(!m) return
    // let type = m.groups.type;

    // // Rename to the pretedermined types
    // if(type === "watch") type = "song";
    // else if(type === "channel") type = "artist";
    // else if(type === "browse" | type === "playlist") type = "album";

    // const itemData = {
    //     type,
    //     "title": undefined,
    //     "artists": [],
    // };
    
    // if(type === "artist") {
    //     const titleTag = document.querySelector("*.title[role=heading]");
    //     if(titleTag) {
    //         itemData.title = titleTag.childNodes[0].textContent.trim();
    //     }
    // } else if(type === "album") {
    //     const titleTag = document.querySelector("div.metadata h2");
    //     if(titleTag) {
    //         itemData.title = titleTag.textContent.trim();
    //     }
    //     const metadataTag = document.querySelector("div.metadata .subtitle");
    //     const [type_, artist, year] = metadataTag.textContent.split(" • ");
    //     // YouTubeMusic has albums on /browse and /playlist,
    //     // here I check that it is an actual album and not a playlist
    //     if(type_ !== "album") {
    //         return
    //     }
    //     if(metadataTag) {
    //         itemData.artists.push(artist);
    //     }
    // } else if(type === "song") {
    //     // Get the primary artist
    //     const metadataTag = document.querySelector("div.content-info-wrapper.style-scope span.subtitle yt-formatted-string.ytmusic-player-bar");
    //     if(metadataTag) {
    //         let primaryArtist = metadataTag.title.split(" • ")[0];
    //         itemData.artists.push(primaryArtist);
    //     }
    //     // Get the track title
    //     const titleTag = document.querySelector("div.content-info-wrapper.style-scope > yt-formatted-string.title");
    //     if(titleTag) {
    //         itemData.title = titleTag.textContent;
    //     }
    // }

	// return itemData;
}

/** Extracts data from the current page on YouTube Music
 * 
 * * Only album and artist pages supported
 * @returns {itemData}
 */
const cpYouTubeMusic = function() {

    // Checks what type of page the user is on based on the URL, and gets the type
    const m = window.location.href.match(/music\.youtube\.com\/(?<type>playlist|channel|watch|browse)/);
    if(!m) return
    let type = m.groups.type;

    // Rename to the pretedermined types
    if(type === "watch") type = "song";
    else if(type === "channel") type = "artist";
    else if(type === "browse" | type === "playlist") type = "album";

    const itemData = {
        type,
        "title": undefined,
        "artists": [],
    };
    
    if(type === "artist") {
        const titleTag = document.querySelector("*.title[role=heading]");
        if(titleTag) {
            itemData.title = titleTag.childNodes[0].textContent.trim();
        }
    } else if(type === "album") {
        const titleTag = document.querySelector("div.metadata h2");
        if(titleTag) {
            itemData.title = titleTag.textContent.trim();
        }
        const metadataTag = document.querySelector("div.metadata .subtitle");
        const [type_, artist, year] = metadataTag.textContent.split(" • ");
        // YouTubeMusic has albums on /browse and /playlist,
        // here I check that it is an actual album and not a playlist
        if(type_ !== "album") {
            return
        }
        if(metadataTag) {
            itemData.artists.push(artist);
        }
    } else if(type === "song") {
        // Get the primary artist
        const metadataTag = document.querySelector("div.content-info-wrapper.style-scope span.subtitle yt-formatted-string.ytmusic-player-bar");
        if(metadataTag) {
            let primaryArtist = metadataTag.title.split(" • ")[0];
            itemData.artists.push(primaryArtist);
        }
        // Get the track title
        const titleTag = document.querySelector("div.content-info-wrapper.style-scope > yt-formatted-string.title");
        if(titleTag) {
            itemData.title = titleTag.textContent;
        }
    }

	return itemData;
}



///// Desktop URIs /////

/** Gets a URI to open the item on the current page on the Spotify Desktop App
 * 
 * @returns {string} desktopURI
 */
const dURISpotify = function() {
    let tag = document.querySelector("a[aria-label*='Now playing:']");
    if(!tag) return;
    let url = tag.getAttribute("href"); // To prevent the concatenation of the base URL

    const desktopURI = `spotify:/${url}`;
    return desktopURI;
}

/** GGets a URI to open the item on the current page on the desktop version of Apple Music (or Itunes on Windows)
 * 
 * @returns {string} desktopURI
 */
const dURIAppleMusic = function () {
    const tag = document.querySelector(".web-chrome-playback-lcd__now-playing-container a.web-chrome-playback-lcd__sub-copy-scroll-link:nth-last-of-type(1)");
    if(!tag) return;
    const url = tag.href;

    // replacing the http(s) protocol with itmss opens the URI on Apple Music or iTunes Desktop (Windows)
    const desktopURI = url.replace(/(https|http)/, "itmss");
    return desktopURI;
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