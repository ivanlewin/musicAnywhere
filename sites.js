const getTrackInfoAppleMusic = function() {

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
