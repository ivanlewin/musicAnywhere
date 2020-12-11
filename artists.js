'use strict';
console.log("popupp.js");

const getArtist = function(page) {
	let firstArtist = "";
	switch(page) {

		case "spotify":
			const selector = "a[aria-label*='Now playing:']";
			const tag = document.querySelector(selector);
			if(!tag) return;
			const playingTrack = tag.ariaLabel;
			const m = playingTrack.match(/Now playing: (?<title>.+) by (?<artists>.+)/);
	
			const artists = m.groups.artists;
			firstArtist = artists.split(",")[0];
			break;

		return firstArtist;
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

const searchIn = function(page) {
	const searchURLs = {
		"appleMusic": "https://music.apple.com/us/search?term=",
		"genius": "https://genius.com/search?q=",
		"musixmatch": "https://www.musixmatch.com/search/",
		"spotify": "https://open.spotify.com/search/",
		"youtube": "https://www.youtube.com/results?search_query=",
		"youtubeMusic": "https://music.youtube.com/search?q=}"
	}

	console.log(searchURLs[page])
}