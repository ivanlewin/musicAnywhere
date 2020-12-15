'use strict';

const supportedSites = [
	{url: "music.apple.com", icons: "apple-music"},
	{url: "genius.com", icons: "genius"},
	{url: "www.musixmatch.com", icons: "musixmatch"},
	{url: "open.spotify.com", icons: "spotify"},
	{url: "www.youtube.com", icons: "youtube"},
	{url: "music.youtube.com", icons: "youtube"},
]

const createRules = function() {
	// Creates an array of rules to show the page action on the supported sites (and set the page action icon)
	const rules = [];

	for(let site of supportedSites) {
		// createSetIconAction(site.icons, function(action) {
		// 	const rule = {};
		// 	rule.actions = [ new chrome.declarativeContent.ShowPageAction(), action ];
		// 	rule.conditions = [new chrome.declarativeContent.PageStateMatcher({
		// 		pageUrl: {hostContains: site.url}
		// 	})];

		// 	rules.push(rule);
		// })
		
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

chrome.runtime.onInstalled.addListener(() => {
	// Replace all rules ...
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		// With new ones
		chrome.declarativeContent.onPageChanged.addRules(createRules());
	});
});

// https://stackoverflow.com/a/28765872
const createSetIconAction = function(filename, callback) {
	const path16 = `./images/icons/${filename}_16.png`;
	const path32 = `./images/icons/${filename}_32.png`;
	const path48 = `./images/icons/${filename}_48.png`;
	const path128 = `./images/icons/${filename}_128.png`;

	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	const image16 = new Image();
	image16.onload = function() {
		ctx.drawImage(image16,0,0,16,16);
		const imageData16 = ctx.getImageData(0,0,16,16);
		const image32 = new Image();
		image32.onload = function() {
			ctx.drawImage(image32,0,0,32,32);
			const imageData32 = ctx.getImageData(0,0,32,32);
			const image48 = new Image();
			image48.onload = function() {
				ctx.drawImage(image48,0,0,48,48);
				const imageData48 = ctx.getImageData(0,0,48,48);
				const image128 = new Image();
				image128.onload = function() {
					ctx.drawImage(image128,0,0,128,128);
					const imageData128 = ctx.getImageData(0,0,128,128);
					const action = new chrome.declarativeContent.SetIcon({imageData: {16: imageData16, 32: imageData32, 48: imageData48, 128: imageData128}})
					callback(action);
				}
				image128.src = chrome.runtime.getURL(path128);
			}
			image48.src = chrome.runtime.getURL(path48);
		}
		image32.src = chrome.runtime.getURL(path32);
	}
	image16.src = chrome.runtime.getURL(path16);
}