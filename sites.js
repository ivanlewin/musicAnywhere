const getTrackInfoAppleMusic = function() {

};

const getTrackInfoGenius = function() {

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