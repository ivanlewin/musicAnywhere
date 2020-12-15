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
console.log("title: ", title);
console.log("url: ", url);
// window.open(url);