"use strict";
const buttons = document.querySelectorAll(".search-media");
const mediaSrcSelect = document.querySelector("#mediaSrc");
let mediaSrc;
let siteName;
let itemData;
let desktopUri;

/** Returns a URL with a search query for the track on the given site
 * 
 * @param {String} site
 * @param {String} title
 * @param {Array<String>} artistsArr
 */
const getSiteURL = function(site, title, artistsArr) {
	
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
	const searchQuery = `${title} ${artists}`.trim();

	return searchURL + encodeURI(searchQuery);
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

/** Sends a message to the active tab's content-script
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
	if(!mediaSrc || !itemData) { return }

	let text = "";

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

	document.querySelector("#currentMedia").textContent = text;
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

mediaSrcSelect.addEventListener("change", e => {
	mediaSrc = e.target.value;
	chrome.storage.local.set( { mediaSrc });
	updateMedia();
})

window.addEventListener("load", () => {
	chrome.tabs.executeScript(
		null,
		{ file: "./content-script.js" },
		main
	);
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