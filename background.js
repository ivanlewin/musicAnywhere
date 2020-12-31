'use strict';

const supportedSites = [
	{url: "music.apple.com", icons: "apple-music"},
	{url: "genius.com", icons: "genius"},
	{url: "www.musixmatch.com", icons: "musixmatch"},
	{url: "open.spotify.com", icons: "spotify"},
	{url: "www.youtube.com", icons: "youtube"},
	{url: "music.youtube.com", icons: "youtube-music"},
]

const createRules = function() {
	// Creates an array of rules to show the page action on the supported sites (and set the page action icon)
	const rules = supportedSites.map( site => {
		return {
			actions: [ new chrome.declarativeContent.ShowPageAction() ],
			conditions: [ new chrome.declarativeContent.PageStateMatcher({ pageUrl: {hostContains: site.url} }) ]
		}
	});
	
	return rules;
}

chrome.runtime.onInstalled.addListener(() => {
	// Replace all rules ...
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		// With new ones
		chrome.declarativeContent.onPageChanged.addRules(createRules());
	});
});