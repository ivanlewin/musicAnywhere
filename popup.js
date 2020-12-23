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

/** Creates a connection for message passing and immediately posts a message to that new connection. */
const connect = function() {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const port = chrome.tabs.connect(tabs[0].id);  // Creates a port to the content script
		port.postMessage({ function: "getSiteInfo" });  // Sends a message
		port.onMessage.addListener(response => {
			handleResponse(response);
			port.disconnect();  // Disconnect the port as there's only going to be one message
		})
	});
