"use strict";

const links = document.querySelectorAll(".link");

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
}

const handleResponse = function(response) {
	try {
		const {artists, title} = response;
		console.log("title: ", title);
		console.log("artists: ", artists);

		links.forEach(tag => {
			tag.href = searchIn(tag.dataset.site, title, artists);
		})

	} catch (e) {
		console.error(e);
	}
}

/** Inject the content script to the tab once the extension has loaded and then starts a connection */
window.addEventListener("load", (e) => {
	chrome.tabs.executeScript(
		null,
		{file: "./trackinfo.js"},  // The content script
		() => connect())  // Establish the connection afterwards
});