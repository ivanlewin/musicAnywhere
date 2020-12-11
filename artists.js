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

		case "genius": {
			const selector = "a[class*='primary_artist']";
			const tag = document.querySelector(selector);
			if(!tag) return;
			artist = tag.textContent.trim();

			break;
		}

		case "musixmatch": {
			const selector = "title";
			const tag = document.querySelector(selector);
			if(!tag) return;
			const playingTrack = tag.textContent;
			const m = playingTrack.match(/(?<artists>.+) - (?<title>.+) Lyrics \| Musixmatch/)

			const artists = m.groups.artists;
			artist = artists.replace(/ feat\..*/, "");

			break;
		}
	}

	return artist;
}

const getTitle = function(page) {
	let withoutFeat = "";
	switch(page) {

		case "spotify": {
			const selector = "a[aria-label*='Now playing:']";
			const tag = document.querySelector(selector);
			if(!tag) return;
			const playingTrack = tag.ariaLabel;
			const m = playingTrack.match(/Now playing: (?<title>.+) by (?<artists>.+)/);

			const title = m.groups.title;
			withoutFeat = title.replace(/ \(feat\..*\)/, "");

			break;
		}

		case "youtubeMusic": {
			const selector = "div.content-info-wrapper.style-scope > yt-formatted-string.title";
			const tag = document.querySelector(selector);
			if(!tag) return;
			
			const title = tag.textContent;
			withoutFeat = title.replace(/ \(feat\..*\)/, "");
			break;
		}

		case "youtube": {
			break;
		}

		case "genius": {
			const selector = "h1[class*='primary_info-title']";
			const tag = document.querySelector(selector);
			if(!tag) return;

			withoutFeat = tag.textContent.trim();
			break;
		}

		case "musixmatch": {
			const selector = "title";
			const tag = document.querySelector(selector);
			if(!tag) return;
			const playingTrack = tag.textContent;
			const m = playingTrack.match(/(?<artists>.+) - (?<title>.+) Lyrics \| Musixmatch/)

			const title = m.groups.title;
			withoutFeat = title.replace(/ \(feat\..*\)/, "");

			break;
		}
	}

	return withoutFeat;
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