"use strict";

const links = document.querySelectorAll(".link");

/** Returns a URL with a search query for the track on the given site. */
const getSearchURL = function(site, title, artistsArr) {
	
	const searchURLs = [
		{site: "appleMusic", URL: "https://music.apple.com/us/search?term="},
		{site: "genius", URL: "https://genius.com/search?q="},
		{site: "musixmatch", URL: "https://www.musixmatch.com/search/"},
		{site: "spotify", URL: "https://open.spotify.com/search/"},
		{site: "youtube", URL: "https://www.youtube.com/results?search_query="},
		{site: "youtubeMusic", URL: "https://music.youtube.com/search?q="}
	]

	const searchURL = searchURLs.filter(s => s.site === site)[0].URL;
	const artists = artistsArr.join(" ");
	const searchQuery = `${title} ${artists}`;

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
			tag.href = getSearchURL(tag.dataset.site, title, artists);
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