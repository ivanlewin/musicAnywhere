"use strict";
const searchMediaBtns = document.querySelectorAll("button.search-media");
const openInDesktopBtns = document.querySelectorAll("button.open-in-desktop");
const mediaSrcSelect = document.querySelector("#mediaSrc");
const currentMedia = document.querySelector("#currentMedia");
const mediaTypeSpans = document.querySelectorAll("span.media-type");
// let mediaSrc;
// let siteName;
// let itemData;
// let desktopURI;

/**
 * @typedef {Object} itemData
 * @property {"song" | "album" | "artist"} type - The item type
 * @property {string} title - The song or album title or the artist name
 * @property {Array} artists - An array containing the song or album artist(s). Empty if type == artist
 */

/**
 * @typedef {"appleMusic" | "genius" | "musixmatch" | "spotify" | "youtube" | "youtubeMusic"} supportedSite
 */

/**
 * @typedef {"currentPage" | "playingSong"} mediaSrc
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

///// Helpers /////

/** Returns a URL with a search query for the track on the given site
 * 
 * @param {supportedSite} siteName
 * @param {String} title
 * @param {Array<String>} artistsArr
 */
const getSearchURL = function(siteName, title, artistsArr) {
	if(siteName in supportedSites) {
		const searchURL = supportedSites[siteName].searchURL;
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

/** Sets the PageAction icon to the logo of the site
 * 
 * @param {supportedSite} siteName
 */
const setPageActionIcon = function(siteName) {
	if(supportedSites[siteName] && supportedSites[siteName].icons) {
		const iconName = supportedSites[siteName].icons;

		chrome.tabs.query(
			{active: true, currentWindow: true},
			tabs => {
				chrome.pageAction.setIcon({
					tabId: tabs[0].id,
					path: {
						"16": `./images/icons/${iconName}_16.png`,
						"32": `./images/icons/${iconName}_32.png`,
						"48": `./images/icons/${iconName}_48.png`,
						"128": `./images/icons/${iconName}_128.png`
					}
				});
			}
		);
	}
}


///// Content script /////

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

/** Calls the content script and asks it to return the current site name
 * 
 * @returns {Promise<supportedSite>} siteName
 */
const getSiteName = function() {
	return new Promise( (resolve, reject) => {
		contentScriptRun("getSiteName", siteName => {
			if(siteName) resolve(siteName);
			else reject();
		});
	})
}

/** Calls the content script and asks it to return an itemData object for the current media
 * 
 * @param {mediaSrc} mediaSrc 
 * @returns {Promise<itemData>}
 */
const getItemData = function(mediaSrc) {
	return new Promise( (resolve, reject) => {
		if(mediaSrc === "playingSong") {
			contentScriptRun("getDataPlayingSong", itemData => {
				if(itemData) resolve(itemData);
				else reject(null);
			});
	
		} else if(mediaSrc === "currentPage") {
			contentScriptRun("getDataCurrentPage", itemData => {
				if(itemData) resolve(itemData);
				else reject(null);
			});
		}
	});
}

/** Calls the content script and asks it to return a desktopURI link
 * 
 * @returns {Promise<String>}
 */
const getDesktopURI = function() {
	return new Promise( (resolve, reject) => {
		contentScriptRun("getDesktopURI", desktopURI => {
			if(desktopURI) resolve(desktopURI);
			else reject();
		});
	})
}






/** Tries to get the mediaSrc value from Chrome storage and falls back to the mediaSrcSelect value
 * 
 * @returns {Promise<mediaSrc>}
 */
const getMediaSrc = function() {
	return new Promise( (resolve, reject) => {
		chrome.storage.local.get(["mediaSrc"], res => {
			if(res.mediaSrc) {
				// Update the <select>
				document.querySelector(`#mediaSrc #currentPage`).selected = false;
				document.querySelector(`#mediaSrc #playingSong`).selected = false;
				document.querySelector(`#mediaSrc #${res.mediaSrc}`).selected = true;
				resolve(res.mediaSrc)
			}
			else if(mediaSrcSelect.value) resolve(mediaSrcSelect.value)
			else reject();
		});
	});
}

///// Show and hide items /////

/** Sets or removes the text (if no media provided) in the p#currentMedia and the span.media-type
 * 
 * @param {mediaSrc} mediaSrc 
 * @param {itemData} itemData 
 */
const displayItemData = function(mediaSrc, itemData) {

	let text = "";
	let type = "";

	// Reset the content of p#currentMedia and all the span.media-type
	currentMedia.textContent = "";
	mediaTypeSpans.forEach( span => span.textContent = "");
	
	// Create the message for the current media
	if(mediaSrc === "currentPage") {
		text += `You're looking at ${itemData.title}`;
		if(itemData.artists.length) { text += ` by ${itemData.artists.join(", ")}` }
		type = itemData.type;
	}
	else if(mediaSrc === "playingSong") {
		text += `You're listening to ${itemData.title}`;
		if(itemData.artists.length) { text += ` by ${itemData.artists.join(", ")}` }
		type = itemData.type;
	}

	currentMedia.textContent = text; // Set the text to the p#currentMedia
	mediaTypeSpans.forEach( span => span.textContent = type); // Set the mediaType to all the span.media-type
}

/** Hides and disables the button to search the media on the same site
 * 
 * @param {supportedSite} siteName
 */
const hideSameSiteBtn = function(siteName) {
	const sameSiteBtn = document.querySelector(`button#${siteName}-search-media`);
	sameSiteBtn.disabled = true;
	sameSiteBtn.style.display = "none";
	sameSiteBtn.onclick = null;
}




const updateMedia = function(){
	getMediaSrc()
		.then(mediaSrc => Promise.all([mediaSrc, getItemData(mediaSrc)]) )
		.then( ([mediaSrc, itemData]) => {
			displayItemData(mediaSrc, itemData);
			updateSearchMediaBtns(itemData);
		})
		.catch( () => { 
			displayItemData();
			updateSearchMediaBtns();
		});
}

const updateSearchMediaBtns = function(itemData) {
	if(itemData) {
		searchMediaBtns.forEach( btn => {
			const btnSite = btn.dataset.siteName;
			const searchURL = getSearchURL(btnSite, itemData.title, itemData.artists);
			
			btn.onclick = () => chrome.tabs.create({ url: searchURL });
			btn.disabled = false;
		});
	} else {
		searchMediaBtns.forEach( btn => {
			btn.disabled = true;
			btn.onclick = null;
		});
	}
}

const updateDesktopURIBtns = function(siteName, desktopURI) {
	if(desktopURI) {
		if(siteName === "spotify" || siteName === "appleMusic") {
			const siteBtn = document.querySelector(`#${siteName}-open-in-desktop`);
			siteBtn.disabled = false;
			siteBtn.style.display = "initial";
			siteBtn.onclick = () => { chrome.tabs.create({ url: desktopURI }) };
		}
	} else {
		openInDesktopBtns.forEach( btn => {
			btn.disabled = true;
			btn.style.display = "none";
			btn.onclick = null;
		})
	}
}

const siteSpecificActions = function(siteName) {
	if(siteName === "spotify" || siteName === "appleMusic") {
		updateDesktopURIBtns(siteName);
		const siteBtn = document.querySelector(`#${siteName}-open-in-desktop`);
		getDesktopURI()
		.then(desktopURI => {
			siteBtn.disabled = false;
			siteBtn.style.display = "initial";
			siteBtn.onclick = () => { chrome.tabs.create({ url: desktopURI }) };
		})
		.catch(error => console.error(error))
	}
}

const main = function() {
	getSiteName()
	.then(siteName => {
		setPageActionIcon(siteName);
		hideSameSiteBtn(siteName);
		// siteSpecificActions(siteName);
		// return Promise.all([siteName, getDesktopURI(siteName)]);
	})
	// .then(([siteName, desktopURI]) => updateDesktopURIBtns(desktopURI))
	.catch( () => {
		updateDesktopURIBtns()
	});

	updateMedia();
}

/** Sends a test message to the content script on the active tab and loads it if it hasn't been already
 * 
 * @param {Function} callback
 */
const verifyContentScript = function(callback) {
	// Sends a message to the active tab, which could have a content script already injected, listening to messages
	contentScriptRun("test", response => {
		// If response is ok, get on with the callback
		if(response === "ok") callback();
		// Checking that an error was produced while connecting with the content script, namely because it wasn't already there
		else if(chrome.runtime.lastError) {
			const errorMsg = chrome.runtime.lastError.message.trim();
			// Check that it was, effectively, because it wasn't injected
			if(errorMsg === "Could not establish connection. Receiving end does not exist.") {
				// Inject the content script onto the tab and run the callback
				chrome.tabs.executeScript(
					null,
					{ file: "./content-script.js" },
					callback
				);
			}
		}
	});
}

window.onload = () => { verifyContentScript(main) };

// Update the media when the mediaSrc changes
mediaSrcSelect.addEventListener("change", e => {
	const newMediaSrc = e.target.value;
	chrome.storage.local.set(
		{ mediaSrc: newMediaSrc },
		updateMedia
	);
})