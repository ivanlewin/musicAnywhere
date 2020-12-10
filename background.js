'use strict';

const supportedSites = [
	{url: "youtube.com", icons: "youtube"},
	{url: "music.youtube.com", icons: "youtube"},
	{url: "open.spotify.com", icons: "spotify"},
	{url: "www.musixmatch.com", icons: "musixmatch"},
	{url: "genius.com", icons: "genius"},
	{url: "music.apple.com", icons: "apple-music"}
]

const createRules = function() {
	const rules = [];

	for(let site of supportedSites) {
		const rule = {};
		rule.actions = [new chrome.declarativeContent.ShowPageAction(),
			// new chrome.declarativeContent.setIcon({
			//     path: {
			//         "16": `images/icons/${site.icons}_16.png`,
			//         "32": `images/icons/${site.icons}_32.png`,
			//         "48": `images/icons/${site.icons}_48.png`,
			//         "128": `images/icons/${site.icons}_128.png`
			//     }
			// })
		];
		
		rule.conditions = [new chrome.declarativeContent.PageStateMatcher({
			pageUrl: {hostContains: site.url}
		})];

		rules.push(rule);
	}
	
	return rules
}

chrome.runtime.onInstalled.addListener(function() {
	chrome.storage.sync.set({color: '#3aa757'}, function() {
		console.log('The color is green.');
	});
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
	// Replace all rules ...
		chrome.declarativeContent.onPageChanged.addRules(createRules());
	});
});