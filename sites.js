const getTrackInfoAppleMusic = function() {

};


const getTrackInfoGenius = function() {

    const trackInfo = {
        "title": undefined,
        "artists": []
    };
    
    // Get the primary artist
    let tag = document.querySelector("a[class*='primary_artist']");
    if(!tag) return;
    let primaryArtist = tag.textContent.trim();

    trackInfo.artists.push(primaryArtist);

    // Get the featuring artists
    let tags = document.querySelectorAll("expandable-list[label='Featuring'] span[ng-repeat*='artist in collection'] a");
    if(!tags) return;
    let tagArray = Array.from(tags); // Make an array from the NodeList
    let featuringArtists = tagArray.map(tag => tag.textContent.trim());

    trackInfo.artists.push(...featuringArtists);

    // Get the track title
    const tag = document.querySelector("h1[class*='primary_info-title']");
    if(!tag) return;
    let title = tag.textContent.trim();

    trackInfo.title = title;

    return trackInfo;
};

const getTrackInfoMusixmatch = function() {

};

const getTrackInfoSpotfiy = function() {

	const trackInfo = {};

	const tag = document.querySelector("a[aria-label*='Now playing:']");
	if(!tag) return;
	const playingTrack = tag.ariaLabel;
	const m = playingTrack.match(/Now playing: (?<title>.+) by (?<artists>.+)/);
	if(!m) return;

	trackInfo.artists = m.groups.artists.split(",");
	trackInfo.title = m.groups.title.replace(/ \(feat\..*\)/, "");

	return trackInfo;
};

const getTrackInfoYoutube = function() {

};

const getTrackInfoYoutubeMusic = function() {

};

export { getTrackInfoAppleMusic, getTrackInfoGenius, getTrackInfoMusixmatch, getTrackInfoSpotfiy, getTrackInfoYoutube, getTrackInfoYoutubeMusic }