"use strict";
const linkContainer = document.querySelector(".link-container");
const links = document.querySelectorAll(".link");
const srcForm = document.querySelector("#source");
let src = undefined;
let site, title, artists;

/** Returns a URL with a search query for the track on the given site
 * 
 * @param {String} site
 * @param {String} title
 * @param {Array<String>} artistsArr
 */
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
		title = removeFeaturingArtists(title);
		window.alert(`${site} | ${title} | ${artists}`);
		console.log(`${site} | ${title} | ${artists}`);


const updateLinks = function(title, artists) {
	links.forEach(tag => {
		tag.href = getSiteURL(tag.dataset.site, title, artists);
	})
}

linkContainer.addEventListener("click", (e) => {
	if(e.target.href) {
		chrome.tabs.create({ url: e.target.href });
	}
});

srcForm.addEventListener("change", e => {
	chrome.storage.sync.set({"infoSrc": e.target.value})
	src = e.target.value;
})

