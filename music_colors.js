

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// `DOMContentLoaded` already fired
		action();
	}
}

whenDocumentLoaded(() => {
	console.log('loaded')
	const wheelDiv = document.getElementById("wheel-container");

	const margin = {
	    top: 10,
	    right: 30,
	    bottom: wheelDiv.clientHeight*0.15,
	    left: 10
	  },
	height = d3.min([wheelDiv.clientHeight - margin.top - margin.bottom,
		 wheelDiv.clientWidth - margin.left - margin.right]),
	width = height,
	centerWheelRadius = 60,
	songsPerCircle = 45,
	angleArcPerSong = Math.PI * 2 / songsPerCircle
	outterRadius = d3.min([width, height]) / 2
	;

	const svg = d3.select("#wheel-container").append("svg")
	  .attr("width", (width + margin.left + margin.right))
	  .attr("height", (height + margin.top + margin.bottom))
		.style("float", "right")
		//.style("background-color", "pink")
		.append("g")
		.attr("transform", "translate(" +( width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")")
		;


	d3.csv('small_colors_songs_withSpotify.csv')
	  .then(function(data) {

				var numberCircles = Math.ceil(data.length / songsPerCircle);
				var songsLastCircle = (data.length - 1) % songsPerCircle + 1;
				var circleWidth = (outterRadius - centerWheelRadius) / numberCircles;
				var filledCircleWidth = 0.9 * circleWidth;
				var spaceBetweenCircles = circleWidth - filledCircleWidth;

				var idxOnAllCircles = songsLastCircle * numberCircles;
				var offsetAngle = songsLastCircle * angleArcPerSong;

				var arcGenerator = d3.arc();

				svg.append("circle")
					.attr("class", "center-wheel")
					.attr('cx', 0)
	        .attr('cy', 0)
	        .attr('r', 5)
					.style('fill', "transparent")
	        .style('stroke', 'black');

				var path = svg.selectAll("path")
				 .data(data)
				 .enter().append("path")
				 .attr('class', 'song')
				 .attr("d", function(d, index) {
					 if (index < idxOnAllCircles) {
						 var startAngle = angleArcPerSong * Math.floor(index/numberCircles);
						 var startRadius = centerWheelRadius + spaceBetweenCircles +
						 	circleWidth * (index % numberCircles);
					 } else {
						 var offset = index - idxOnAllCircles;
						 var startAngle = offsetAngle + angleArcPerSong * Math.floor(offset/(numberCircles-1));
						 var startRadius = centerWheelRadius + circleWidth +
						 	spaceBetweenCircles + circleWidth * (index % (numberCircles-1));
					 };
					 return arcGenerator({
							startAngle: startAngle,
							endAngle: startAngle + angleArcPerSong,
							innerRadius: startRadius,
							outerRadius: startRadius + filledCircleWidth
						});
				 })
				 .style("fill", function(d, i) {
					 return 'transparent';
				 })
				 .on('mouseover', function(d, i) {
				   d3.select(this)
					 .style('opacity', '0.5');
				 })

				 .on('mouseout', function(d) {
					 d3.select(this).style('opacity', '1.0');
				 })
				 .on('click', function(d) {
				 	console.log(d);
				 	const song_name = document.getElementById("song-info-name");
				 	const song_artist = document.getElementById("song-info-artist");
				 	const song_genre = document.getElementById("song-info-genre");
				 	const song_position = document.getElementById("song-info-position");
				 	const song_year = document.getElementById("song-info-year");
				 	const song_lyrics = document.getElementById("song-info-lyrics");
					const spotify_player = document.getElementById("spotify-player");
				 	song_name.innerHTML = d.title;
				 	song_artist.innerHTML = d.artist;
				 	song_position.innerHTML = d.pos;
				 	song_year.innerHTML = d.year;
					spotify_player.src = "https://open.spotify.com/embed/track/" + d.spotify_uri;
				 	d.tags = d.tags.replace(/'/g, '"');
				 	d.tags = JSON.parse(d.tags);
				 	song_genre.innerHTML = (d.tags.length > 1) ? d.tags[0] +" "+d.tags[1] : d.tags[0];
				 	lyrics = d.lyrics.split('\n');
				 	text = "..."
				 	for (i = 0; i < lyrics.length; i++) {
				 		if (lyrics[i].includes(d.color)) {
				 			text += lyrics[i - 1] += "\n";
				 			text += lyrics[i] += "\n";
				 			text += lyrics[i + 1] += "\n";
				 		}

					}
					song_lyrics.innerHTML = text + "...";

					function highlight() {
  						const words = song_lyrics.textContent.split(" ");
  						console.log(words);
  						song_lyrics.innerHTML = "";
  						words.forEach((word) => {
    						const span = song_lyrics.appendChild(document.createElement('span'));
    						span.textContent = word + ' ';
    						console.log(d.rgb);
    						if (word === d.color) span.style.color = 'rgb'+d.rgb;
  						});
					};
					song_lyrics.addEventListener("blur", highlight);
					highlight();
				 })
				 .transition()
				 .duration(30)
					.delay(function(d, i) {
 					  return i * 1;
 					})
				 .style("fill", function(d, i){
					 return d.random_rgb;
				 })
				 /*
				 .on("click", function(d, i, index) {
				   location.href = dataset[index].url;
				 })
				 */
				 ;
	  })
	  .catch(function(error){
			console.log(error);
	     // handle error
	  })



});
