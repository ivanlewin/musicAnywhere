"use strict";
const buttons = document.querySelectorAll(".search-media");
const mediaSrcSelect = document.querySelector("#mediaSrc");
const currentMedia = document.querySelector("#currentMedia");
let mediaSrc;
let siteName;
let itemData;
let desktopUri;

/**
 * @typedef {Object} itemData
 * @property {"song" | "album" | "artist"} type - The item type
 * @property {string} title - The song or album title or the artist name
 * @property {Array} artists - An array containing the song or album artist(s). Empty if type == artist
 */

/**
 * @typedef {"appleMusic" | "genius" | "musixmatch" | "spotify" | "youtube" | "youtubeMusic"} supportedSite
 */

const supportedSites = {
	appleMusic: {
		icons: "apple-music",
		searchURL: "https://music.apple.com/us/search?term=",
	},
    genius: {
		icons: "genius",
		searchURL: "https://genius.com/search?q=",
    },
    musixmatch: {
		icons: "musixmatch",
		searchURL: "https://www.musixmatch.com/search/",
    },
    spotify: {
		icons: "spotify",
		searchURL: "https://open.spotify.com/search/",
    },
    youtube: {
		icons: "youtube",
		searchURL: "https://www.youtube.com/results?search_query=",
    },
    youtubeMusic: {
		icons: "youtube-music",
		searchURL: "https://music.youtube.com/search?q=",
	}
}


/** Returns a URL with a search query for the track on the given site
 * 
 * @param {supportedSite} site
 * @param {String} title
 * @param {Array<String>} artistsArr
 */
const getSiteURL = function(site, title, artistsArr) {
	if(site in supportedSites) {
		const searchURL = supportedSites[site].searchURL;
		const artists = artistsArr.join(" ");
		const searchQuery = `${title} ${artists}`.trim();
	
		return searchURL + encodeURI(searchQuery);
	}
}

/** Removes the "feat. / featuring " info  from the given text
 * 
 * @param {String} text
 * 
*/
const removeFeaturingArtists = function(text) {
	return text.replace(/ \((?:feat|featuring)\..*\)/, "");
}

/** Converts a YouTube URL to a YouTube Music one and vice-versa
 * 
 * @param {string} url
*/
const convertYouTubeAndYouTubeMusic = function (url) {
	if(url.includes("www.youtube.com")) return url.replace("www.youtube.com", "music.youtube.com")
	else if(url.includes("music.youtube.com")) return url.replace("music.youtube.com", "www.youtube.com")
}

const hideSiteButton = function(site) {
	try {
		document.querySelector(`button#${site}-search-media`).siteButton.style.display = "none";
	} catch(e) {
		console.error(e);
	}
}

/** Sends a message to the active tab's content script
 * telling it to run the 'fn' function
 * 
 * @param {string} fn
 * @param {Function} cb
 * */
const contentScriptRun = function(fn, cb) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(
			tabs[0].id,
			{ run : fn},
			response => cb(response) );
	});
}

const displayItemData = function() {

	let text = "";
	currentMedia.textContent = text;
	currentMedia.style.display = "hidden";

	if(!itemData) { return }

	if(mediaSrc === "currentPage") {
		text += `You're looking at ${itemData.title}`;
		if(itemData.artists.length) {
			text += ` by ${itemData.artists.join(", ")}`;
		}
	} else if(mediaSrc === "playingSong") {
		text += `You're listening to ${itemData.title}`;
		if(itemData.artists.length) {
			text += ` by ${itemData.artists.join(", ")}`;
		}
	}

	currentMedia.textContent = text;
	currentMedia.style.display = "initial";
}

const updateMedia = function() {
	if(mediaSrc === "playingSong") {
		contentScriptRun("getDataPlayingSong", data => {
			itemData = data;
			displayItemData();
		});

		document.querySelector("#currentPage").selected = false;
		document.querySelector("#playingSong").selected = true;

	} else if(mediaSrc === "currentPage") {
		contentScriptRun("getDataCurrentPage", data => {
			itemData = data;
			displayItemData();
		});

		document.querySelector("#currentPage").selected = true;
		document.querySelector("#playingSong").selected = false;
	}
}

/** Sends a test message to the content script on the active tab and loads it if it hasn't been already
 * 
 * @param {Function} callback
 */
const verifyContentScript = function(callback) {
	// Sends a message to the active tab, which could have a content script already injected, listening to messages
	contentScriptRun("test", (response) => {
		// If response is ok, get on with the callback
		if(response === "ok") callback();
		// Checking that an error was produced while connecting with the content script, namely because it wasn't already there
		else if(chrome.runtime.lastError) {
			const errorMsg = chrome.runtime.lastError.message.trim();
			// Check that it was, effectively, because it wasn't injected
			if(errorMsg === "Could not establish connection. Receiving end does not exist.") {
				// Inject the content script onto the tab and run the callback
				console.log("Injecting content script");
				chrome.tabs.executeScript(
					null,
					{ file: "./content-script.js" },
					callback
				);
			}
		}
	});
}

mediaSrcSelect.addEventListener("change", e => {
	mediaSrc = e.target.value;
	chrome.storage.local.set( { mediaSrc });
	updateMedia();
})

window.addEventListener("load", () => {
	verifyContentScript(main);
});

buttons.forEach( btn => {
	btn.addEventListener("click", () => {
		const btnSite = btn.dataset.siteName;
		if(itemData && itemData.title && itemData.artists) {
			const siteURL = getSiteURL(btnSite, itemData.title, itemData.artists);
			if(!siteURL) return
			chrome.tabs.create({ url: siteURL });
		}
	})
})


const main = function() {
	
	contentScriptRun("getSiteName", sn => {
		if(sn) siteName = sn;
		setPageActionIcon();
	});

	chrome.storage.local.get(["mediaSrc"], result => {
		if(result.mediaSrc) {
			mediaSrc = result.mediaSrc;
		} else {
			mediaSrc = mediaSrcSelect.value;
		}

		updateMedia();
	});
	
}


const setPageActionIcon = function() {
	if(!siteName || !supportedSites[siteName]) {
		return
	}

	const iconName = supportedSites[siteName]["icons"];

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.pageAction.setIcon({
			tabId: tabs[0].id,
			path: {
				"16": `./images/icons/${iconName}_16.png`,
				"32": `./images/icons/${iconName}_32.png`,
				"48": `./images/icons/${iconName}_48.png`,
				"128": `./images/icons/${iconName}_128.png`
			}
		});
	})
}

///// Debug ////
// window.addEventListener("load", () => {
// 	contentScriptRun("getSiteName", siteName => {
// 		if(siteName) {
// 			window.alert(`siteName: ${siteName}`);
// 			console.log("siteName:", siteName);
// 		}
// 	});
// 	contentScriptRun("getDataPlayingSong", itemData => {
// 		console.log("getDataPlayingSong")
// 		if(itemData) {
// 			const { type, title, artists } = itemData;
// 			window.alert(`type: ${type} | title: ${title} | artists: ${artists.join(", ")}`);
// 			console.log("type:", type);
// 			console.log("title:", title);
// 			console.log("artists:", artists);
// 		}
// 	});
// 	contentScriptRun("getDataCurrentPage", itemData => {
// 		console.log("getDataCurrentPage")
// 		if(itemData) {
// 			const { type, title, artists } = itemData;
// 			window.alert(`type: ${type} | title: ${title} | artists: ${artists.join(", ")}`);
// 			console.log("type:", type);
// 			console.log("title:", title);
// 			console.log("artists:", artists);
// 		}
// 	});
// })