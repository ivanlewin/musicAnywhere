"use strict";
const linkContainer = document.querySelector(".link-container");
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

const handleResponse = function(response) {
	try {
		const { site, trackInfo: {title, artists} } = response; 
		console.log("site: ", site);
		console.log("title: ", title);
		console.log("artists: ", artists);

		links.forEach(tag => {
			tag.href = getSearchURL(tag.dataset.site, title, artists);
		})

	} catch (e) {
		console.error(e);
	}
}

// 	changeColor.style.backgroundColor = data.color;
// 	changeColor.setAttribute("value", data.color);
// });