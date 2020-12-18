"use strict";

chrome.tabs.executeScript({
	file: "./trackInfo.js"
});

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

/**
 * Taken from https://developer.chrome.com/docs/extensions/mv2/security/#sanitize
*/
const sanitizeInput = function(input) {
    return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

let {title, artists} = getSiteInfo();
console.log("title: ", title);
console.log("artists: ", artists);
const site = "genius";
const url = searchIn(site, title, artists);
window.alert(url);

// let changeColor = document.getElementById("changeColor");

// chrome.storage.sync.get("color", function(data) {
// 	changeColor.style.backgroundColor = data.color;
// 	changeColor.setAttribute("value", data.color);
// });

// changeColor.onclick = function(element) {
// 	let color = element.target.value;
// 	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
// 		chrome.tabs.executeScript(
// 				tabs[0].id,
// 				{code: "document.body.style.backgroundColor = "" + color + "";"});
// 	});
// };