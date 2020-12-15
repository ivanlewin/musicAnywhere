'use strict';
const getArtist = function(page) {
	let artist = "";
	switch(page) {
import { getTrackInfoAppleMusic, getTrackInfoGenius, getTrackInfoMusixmatch, getTrackInfoSpotfiy, getTrackInfoYoutube, getTrackInfoYoutubeMusic } from "./sites.js";


	const artists = [];

			artist = m.groups.artist;

			break;
		}

		// case "youtube": {
		// 	const selector = "div.content-info-wrapper.style-scope yt-formatted-string.ytmusic-player-bar";
		// 	const tag = document.querySelector(selector);
		// 	if(!tag) return;
		// 	const playingTrack = tag.title;
		// 	const m = playingTrack.match(/(?<title>.+) •.* • 2020/)

		// 	artist = m.groups.title;

		// break;
		// }
	}

	return artist;
}

const getTitle = function(page) {
	let withoutFeat = "";
	switch(site) {

		case "youtube": {
			break;
		}
	}

	return withoutFeat;
}

const searchIn = function(page, title, artist) {
	// Returns a URL to a search query for the song on the given page.
	const searchURLs = {
		"appleMusic": "https://music.apple.com/us/search?term=",
		"genius": "https://genius.com/search?q=",
		"musixmatch": "https://www.musixmatch.com/search/",
		"spotify": "https://open.spotify.com/search/",
		"youtube": "https://www.youtube.com/results?search_query=",
		"youtubeMusic": "https://music.youtube.com/search?q="
	}

	return searchURLs[page] + encodeURI(title + " " + artist);
}

let page = "youtubeMusic";
const artist = getArtist(page);
const title = getTitle(page);
const url = searchIn(page, title, artist);
console.log("artist: ", artist);
console.log("title: ", title);
console.log("url: ", url);
// window.open(url);