"use strict"

/**
 * @typedef {Object} trackInfo
 * @property {string} title - The track's title
 * @property {Array} artists - An array containing the track's artist(s)
 */

/**
 * @typedef {"appleMusic" | "genius" | "musixmatch" | "spotify" | "youtube" | "youtubeMusic"} supportedSite
 */

/** Removes the 'feat. / featuring ' info  from a string*/
const removeFeaturingArtists = function(text) {
	return text.replace(/ \((?:feat|featuring)\..*\)/, "");
}

/** Looks for the track info on Apple Music
 * 
 * @returns {trackInfo}
 */
const getTrackInfoAppleMusic = function() {
    const trackInfo = {
        "title": undefined,
        "artists": []
    };

    // Get the primary artist
    let tag = document.querySelector(".web-chrome-playback-lcd__sub-copy-scroll-link");
    if(tag) {
        let primaryArtist = tag.textContent.trim();
        trackInfo.artists.push(primaryArtist);
    }

    // Get the track title
    tag = document.querySelector(".web-chrome-playback-lcd__song-name-scroll-inner-text-wrapper");
    if(tag) {
        let title = tag.textContent.trim();
        trackInfo.title = removeFeaturingArtists(title);

        // Attempt to extract the featuring artists from the title
        let m = title.match(/ \(feat\. (?<featuring>.*)\)/);
        if(!m) return
        let featuringArtists = m.groups.featuring;
        // If there are any featuring artists, push them to the array as well
        if(featuringArtists) {
            featuringArtists = featuringArtists.split(",");
            trackInfo.artists.push(...featuringArtists);
        }
    }


    return trackInfo;
};

/** Looks for the track info on Genius
 * 
 * @returns {trackInfo}
 */
const getTrackInfoGenius = function() {

    const trackInfo = {
        "title": undefined,
        "artists": []
    };
    
    // Get the primary artist
    let tag = document.querySelector("a[class*='primary_artist']");
    if(!tag) return;
    let primaryArtist = tag.textContent.trim();

    trackInfo.artists.push(primaryArtist);

    // Get the featuring artists
    let tags = document.querySelectorAll("expandable-list[label='Featuring'] span[ng-repeat*='artist in collection'] a");
    if(!tags) return;
    let tagArray = Array.from(tags); // Make an array from the NodeList
    let featuringArtists = tagArray.map(tag => tag.textContent.trim());

    trackInfo.artists.push(...featuringArtists);

    // Get the track title
    tag = document.querySelector("h1[class*='primary_info-title']");
    if(!tag) return;
    let title = tag.textContent.trim();

    trackInfo.title = removeFeaturingArtists(title);

    return trackInfo;
};

/** Looks for the track info on Musixmatch
 * 
 * @returns {trackInfo}
 */
const getTrackInfoMusixmatch = function() {

    const trackInfo = {
        "title": undefined,
        "artists": []
    };
    
    // Get the <title> tag, which contains the title and the artists
    let tag = document.querySelector("title");
    if(!tag) return;
    let playingTrack = tag.textContent;
    let m = playingTrack.match(/(?<artists>.+) - (?<title>.+) Lyrics \| Musixmatch/);
    if(!m) return;

    // Separate into primary and featuring artists
    let [primaryArtist, featuringArtists] = m.groups.artists.split(" feat. ");
    trackInfo.artists.push(primaryArtist);
    // If there are any featuring artists, push them to the array as well
    if(featuringArtists) {
        featuringArtists = featuringArtists.split(",");
        trackInfo.artists.push(...featuringArtists);
    }

    let title = m.groups.title
    trackInfo.title = removeFeaturingArtists(title);

    return trackInfo;
};

/** Looks for the track info on Spotify
 * 
 * @returns {trackInfo}
 */
const getTrackInfoSpotfiy = function() {

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
	trackInfo.title = removeFeaturingArtists(title);

	return trackInfo;
};

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
        trackInfo.title = removeFeaturingArtists(title)
    }


    return trackInfo;
};

/** Matches the hostname to an object of the supported sites and returns the appropriate function */
const getSiteInfo = function() {

	const hostname = new URL(window.location.href).hostname;

	switch(hostname) {
		case "music.apple.com": {
			return getTrackInfoAppleMusic();
		}
		case "genius.com": {
			return getTrackInfoGenius();
		}
		case "www.musixmatch.com": {
			return getTrackInfoMusixmatch();
		}
		case "open.spotify.com": {
			return getTrackInfoSpotfiy();
		}
		case "www.youtube.com": {
			return getTrackInfoYoutube();
		}
		case "music.youtube.com": {
			return getTrackInfoYoutubeMusic();
		}
		default: {
			return;
		}
	}
};

/** Awaits for a connection from the pageAction */
chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((msg) => {
        if (msg.function == "getSiteInfo") {
            try {
                const siteInfo = getSiteInfo();
                port.postMessage(siteInfo);
            } catch (e) {
                console.error(e);
            }
        }
    });
});