"use strict"
import { getTrackInfoAppleMusic, getTrackInfoGenius, getTrackInfoMusixmatch, getTrackInfoSpotfiy, getTrackInfoYoutube, getTrackInfoYoutubeMusic } from "./sites.js";

// chrome.runtime.getURL("./site.js");


}

const getSiteInfo = function() {

	const hostname = new URL(window.location.href).hostname;
	console.log(hostname)

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
};