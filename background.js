"use strict";

const supportedSites = [
	{hostname: "music.apple.com"},
	{hostname: "genius.com"},
	{hostname: "www.musixmatch.com"},
	{hostname: "open.spotify.com"},
	{hostname: "www.youtube.com"},
	{hostname: "music.youtube.com"},
]

const createRules = function() {
	// Creates an array of rules to show the page action on the supported sites (and set the page action icon)
	const rules = supportedSites.map( site => {
		return {
			actions: [ new chrome.declarativeContent.ShowPageAction() ],
			conditions: [ new chrome.declarativeContent.PageStateMatcher({ pageUrl: {hostContains: site.hostname} }) ]
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