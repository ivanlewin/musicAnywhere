'use strict';
console.log("popupp.js");

const getArtist = function(page) {
	if(page === "spotify") {
		const selector = "a[aria-label*='Now playing:']";
		const tag = document.querySelector(selector);
		if(!tag) return;
		const playingTrack = tag.ariaLabel;
		const m = playingTrack.match(/Now playing: (?<title>.+) by (?<artists>.+)/);

		const artists = m.groups.artists;
		const firstArtist = artists.split(",")[0];

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

