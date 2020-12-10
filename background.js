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
		rule.actions = [new chrome.declarativeContent.ShowPageAction()];
		
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
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        pageUrl: {hostEquals: 'developer.chrome.com'},
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});
