var url = "/getdata";
d3.json(url , function(error, json) {
 
if (error) return console.warn(error);
 
data = json;

trackID1 = data[0].track.id;
trackID2 = data[1].track.id;
trackID3 = data[2].track.id;
trackID4 = data[3].track.id;

console.log(trackID1);
// var trackID = "1fjXkZkZFjl6UIBtO77YyV";

// var iframeLink = "https://open.spotify.com/embed/track/"+trackID;
// console.log(iframeLink);

// IFRAME PLAY BUTTON
var iframe1 = d3.select("#new-play-button").append("iframe")
//.attr("src", iframeLink)
.attr("src", "https://open.spotify.com/embed/track/"+trackID1)
.attr("width", "240")
.attr("height", "80")
.attr("frameborder", "0")
.attr("allowtransparency", "true")
.attr("allow", "encrypted-media")
;

var iframe2 = d3.select("#new-play-button").append("iframe")
//.attr("src", iframeLink)
.attr("src", "https://open.spotify.com/embed/track/"+trackID2)
.attr("width", "240")
.attr("height", "80")
.attr("frameborder", "0")
.attr("allowtransparency", "true")
.attr("allow", "encrypted-media")
;

var iframe3 = d3.select("#new-play-button").append("iframe")
//.attr("src", iframeLink)
.attr("src", "https://open.spotify.com/embed/track/"+trackID3)
.attr("width", "240")
.attr("height", "80")
.attr("frameborder", "0")
.attr("allowtransparency", "true")
.attr("allow", "encrypted-media")
;

var iframe4 = d3.select("#new-play-button").append("iframe")
//.attr("src", iframeLink)
.attr("src", "https://open.spotify.com/embed/track/"+trackID4)
.attr("width", "240")
.attr("height", "80")
.attr("frameborder", "0")
.attr("allowtransparency", "true")
.attr("allow", "encrypted-media")
;

});
