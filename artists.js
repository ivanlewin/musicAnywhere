"use strict"
import { getTrackInfoAppleMusic, getTrackInfoGenius, getTrackInfoMusixmatch, getTrackInfoSpotfiy, getTrackInfoYoutube, getTrackInfoYoutubeMusic } from "./sites.js";

chrome.runtime.getURL("./site.js");

const searchIn = function(site, title, artists) {
	// Returns a URL to a search query for the song on the given site.
	const searchURLs = {
		"appleMusic": "https://music.apple.com/us/search?term=",
		"genius": "https://genius.com/search?q=",
		"musixmatch": "https://www.musixmatch.com/search/",
		"spotify": "https://open.spotify.com/search/",
		"youtube": "https://www.youtube.com/results?search_query=",
		"youtubeMusic": "https://music.youtube.com/search?q="
	}

	artists = artists.join(" ");
	let searchQuery = `${title} ${artists}`;

	return searchURLs[site] + encodeURI(searchQuery);
}

let page = "youtubeMusic";
const artist = getArtist(page);
const title = getTitle(page);
const url = searchIn(page, title, artist);
console.log("artist: ", artist);
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

const {title, artists} = getSiteInfo();
console.log("title: ", title);
console.log("url: ", url);
// window.open(url);