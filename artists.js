'use strict';
console.log("artists.js");

const getArtist = function(page) {
	let artist = "";
	switch(page) {

		case "spotify": {
			const selector = "a[aria-label*='Now playing:']";
			const tag = document.querySelector(selector);
			if(!tag) return;
			const playingTrack = tag.ariaLabel;
			const m = playingTrack.match(/Now playing: (?<title>.+) by (?<artists>.+)/);
	
			const artists = m.groups.artists;
			artist = artists.split(",")[0];
			break;
		}

		case "youtubeMusic": {
			const selector = "div.content-info-wrapper.style-scope span.subtitle yt-formatted-string.ytmusic-player-bar";
			const tag = document.querySelector(selector);
			if(!tag) return;
			const playingTrack = tag.title;
			const m = playingTrack.match(/(?<artist>.+) •.* • 2020/)

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
}

const getTitle = function(page) {
	if(page === "spotify") {
		const selector = "a[aria-label*='Now playing:']";
		const tag = document.querySelector(selector);
		if(!tag) return;
		const playingTrack = tag.ariaLabel;
		const m = playingTrack.match(/Now playing: (?<title>.+) by (?<artists>.+)/);

		const title = m.groups.title;
		const withoutFeat = title.replace(/ \(feat\..*\)/, "");

		return withoutFeat;
	}
}

setTimeout(() => {
	let page = "spotify";
	const artist = getArtist(page);
	const title = getTitle(page);
	searchIn(page);
}, 3000);

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