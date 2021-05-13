

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		action();
	}
}


whenDocumentLoaded(() => {
	const wheelDiv = document.getElementById("wheel-container");

	//global parameters
	//1. prepare the global parameters
	var defaultMargin = wheelDiv.clientWidth*0.02,
	margin = {
			top: defaultMargin,
			right: defaultMargin,
			bottom: wheelDiv.clientHeight*0.15,
			left: defaultMargin
		},
		height = d3.min([wheelDiv.clientHeight - margin.top - margin.bottom,
			 wheelDiv.clientWidth - margin.left - margin.right]),
		width = height,
		songsPerCircle = 45,
		svg = d3.select("#wheel-container").append("svg")
			.attr("width", (width + margin.left + margin.right))
			.attr("height", (height + margin.top + margin.bottom))
			//.style("background-color", "pink")
			.append("g")
			.attr("transform", "translate(" +(width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")"),
		wheelSvg = svg.append("g")
					.attr("transform", "rotate(" + 0 +")")
					.attr("id", "wheelSvg")
					.attr("currentRotation" , 0);

	//2. Store them in a dict
	var globalParameters = {
		defaultMargin : defaultMargin,
		margin : margin,
		height : height,
		width : width,
		centerWheelRadius : height*0.17,
		songsPerCircle : songsPerCircle,
		angleArcPerSong : Math.PI * 2 / songsPerCircle,
		outterRadius : d3.min([width, height]) / 2,
		smallMiddleCircleRadius : height*0.01,
		redrawTime : 500,
		contextHeight : height*0.05,
		contextWidth : width,
		circleIsMoving : false,
		startStoppingCircle : false,
		filters : {
			yearLimitLow : 1951,
			yearLimitHigh : 2015
		},
		arcGenerator : d3.arc(),
		svg : svg,
		wheelSvg : wheelSvg
	};

	d3.csv('small_colors_songs_withSpotify.csv')
	  .then(function(data) {
				createContext(globalParameters, data)

				drawSmallMiddleCircle(globalParameters)

				drawSongTiles(data, globalParameters);
	  })
	  .catch(function(error){
			console.log(error);
	  })
});

function showSongInformation(song){
	const song_name = document.getElementById("song-info-name");
	const song_artist = document.getElementById("song-info-artist");
	const song_genre = document.getElementById("song-info-genre");
	const song_position = document.getElementById("song-info-position");
	const song_year = document.getElementById("song-info-year");
	const song_lyrics = document.getElementById("lyrics-container");
	const spotify_player = document.getElementById("spotify-player");
	song_name.innerHTML = song.title;
	song_artist.innerHTML = song.artist;
	song_position.innerHTML = song.pos;
	song_year.innerHTML = song.year;
	spotify_player.src = "https://open.spotify.com/embed/track/" + song.spotify_uri;
	var tags = song.tags.replace(/"/g, '').replace(/'/g, '"');
	var parsed_tags = JSON.parse(tags);
	song_genre.innerHTML = (parsed_tags.length > 1) ? parsed_tags[0] +" "+ parsed_tags[1] : parsed_tags[0];

	song_lyrics.innerHTML = song.preprocessed_lyrics;

	var offset = getOffsetOfFirstColoredWord();
	song_lyrics.scroll(0, offset);
}

function getOffsetOfFirstColoredWord(){
	var parentPos = d3.select('.colored_word').node().parentNode.getBoundingClientRect(),
			childPos = d3.select('.colored_word').node().getBoundingClientRect();

	var offset = childPos.top - parentPos.top;
	return offset
}

function filterData(data, globalParameters){
	console.log(globalParameters.filters.yearLimitLow);
	return data.filter(function(row){
			if ((globalParameters.filters.yearLimitLow <= row.year) && (row.year <= globalParameters.filters.yearLimitHigh)){ return true; }
			else {return false;}
		});
}

function reDrawCircle(globalParameters){

	d3.select("#wheelSvg")
	.selectAll(".song")
	.attr("class", "removedSongs")
	.transition()
	.duration(1000)
	.style("opacity", 0)
	.remove();

	d3.csv('small_colors_songs_withSpotify.csv')
		.then(function(data) {
				var filteredData = filterData(data, globalParameters)
				drawSongTiles(filteredData, globalParameters);
			 }).catch(function(error){
				console.log(error);
			})
	}

function drawSongTiles(filteredData, globalParameters){
		var numberCircles = Math.ceil(filteredData.length / globalParameters.songsPerCircle);
		var songsLastCircle = (filteredData.length - 1) % globalParameters.songsPerCircle + 1;
		var circleWidth = (globalParameters.outterRadius - globalParameters.centerWheelRadius) / numberCircles;
		var filledCircleWidth = 0.7 * circleWidth;
		var spaceBetweenCircles = circleWidth - filledCircleWidth;

		var idxOnAllCircles = songsLastCircle * numberCircles;
		var offsetAngle = songsLastCircle * globalParameters.angleArcPerSong;

		var path = d3.select("#wheelSvg")
		 .selectAll(".song")
		 .data(filteredData)
		 .enter().append("path")
		 .attr('class', 'song')
		 .attr("d", function(d, index) {
			 if (index < idxOnAllCircles) {
				 var startAngle = globalParameters.angleArcPerSong * Math.floor(index/numberCircles);
				 var startRadius = globalParameters.centerWheelRadius + spaceBetweenCircles +
					circleWidth * (index % numberCircles);
			 } else {
				 var offset = index - idxOnAllCircles;
				 var startAngle = offsetAngle + globalParameters.angleArcPerSong * Math.floor(offset/(numberCircles-1));
				 var startRadius = globalParameters.centerWheelRadius + circleWidth +
					spaceBetweenCircles + circleWidth * (index % (numberCircles-1));
			 };
			 return globalParameters.arcGenerator({
					startAngle: startAngle,
					endAngle: startAngle + globalParameters.angleArcPerSong,
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
			 showSongInformation(d);
			 //uncclass previous selected-song
			 d3.selectAll(".selected-song").attr("class", "song")

			 //add class selected-song to the clicked tile
			 d3.select(this).classed("selected-song", true)
		 })
		 .transition()
		 .duration(30)
		 .delay(function(d, i) {
				return i * globalParameters.redrawTime/filteredData.length;
			})
		 .style("fill", function(d, i){
			 return d.random_rgb;
		 })
	}

function drawSmallMiddleCircle(globalParameters){
	globalParameters.wheelSvg.append("circle")
		.attr("class", "center-wheel")
		.attr('cx', 0)
		.attr('cy', 0)
		.attr('r', globalParameters.smallMiddleCircleRadius)
		.style('fill', "transparent")
		.style('stroke', 'black');
}

function createContext(globalParameters, data){
	// Create a context for a brush
	let context = globalParameters.svg.append("g")
		.attr("class", "context")
		.attr("transform", "translate("+ (-globalParameters.width / 2) +"," + (globalParameters.height / 2 + globalParameters.defaultMargin*2) + ")");


	var contextXScale = d3.scaleTime()
		.range([0, globalParameters.contextWidth])
		.domain(d3.extent(data.map(function(d) {
			return new Date(+d.year, 0, 1);
		}))
	);

	xAxis = g => g
			.attr("transform", `translate(0,${globalParameters.contextHeight})`)
			.call(g => g.append("g")
					.call(d3.axisBottom(contextXScale)
							.ticks(d3.timeYear.every(1))
							.tickSize(-globalParameters.contextHeight)
							.tickFormat((interval,i) => {
								return interval.getFullYear()%5 !== 0 ?
								"" : interval.getFullYear();
							 })
						)
					.call(g => g.select(".domain")
							.attr("fill", "transparent")
							.attr("stroke", null))
					.call(g => g.selectAll(".tick line")
							.attr("stroke", "black")
							.attr("stroke-opacity", d => (+d3.timeYear.every(5).round(d) === +d) ? 1 : 0.5)
							)
						)

						;

	const brush = d3.brushX()
			.extent([[0, 0], [globalParameters.contextWidth, globalParameters.contextHeight]])
			.on("brush", brushed)
			.on("end", brushended)
			;

	context.append("g")
			.call(xAxis);

	context.append("g")
			.call(brush);

	function brushed() {

			const selection = d3.event.selection;
			if (!d3.event.sourceEvent || !selection) return;
			const [x0, x1] = selection.map(d => contextXScale.invert(d));

			/*if (! circleIsMoving){
				startMovingCircle();
			}
			circleIsMoving = true;
			startStoppingCircle = false;*/
		}

	function brushended() {
		const selection = d3.event.selection;
		if (!d3.event.sourceEvent || !selection) return;
		const [x0, x1] = selection.map(d => d3.timeYear.round(contextXScale.invert(d)));
		d3.select(this).transition().call(brush.move, x1 > x0 ? [x0, x1].map(contextXScale) : null);
		globalParameters.startStoppingCircle = true;

		new_x0 = x0.getFullYear();
		new_x1 = x1.getFullYear();

		if ((new_x0 !== globalParameters.filters.yearLimitLow) | (new_x1 !== globalParameters.filters.yearLimitHigh) ){
			globalParameters.filters.yearLimitLow = new_x0;
			globalParameters.filters.yearLimitHigh = new_x1;
			reDrawCircle(globalParameters);
		}
	}
}


//Unused Functions :
function startMovingCircle(){
	d3.selectAll('#wheelSvg')
	.transition()
	.delay(1000)
	.duration(1000)
	.ease(d3.easeQuadIn)
	.attrTween("transform", tween)
	.on("end", moveCircle);

  function tween(d, i, a) {
		var currentRotation = d3.select(this).attr("currentRotation")%360;
		d3.select(this).attr("currentRotation", currentRotation+180)
    return d3.interpolateString("rotate("+currentRotation+")", "rotate("+(currentRotation+180)+")");
  };
}

function moveCircle() {
	d3.selectAll('#wheelSvg')
	.transition()
	.duration(2000)
	.ease(d3.easeLinear)
	.attrTween("transform", tween)
	.on("end", () => {
		if(startStoppingCircle){
			console.log("end");
			circleIsMoving = false;
			startStoppingCircle = false;
			return;
		} else {
			moveCircle();
		}
	});

  function tween(d, i, a) {
		var currentRotation = d3.select(this).attr("currentRotation")%360;
		d3.select(this).attr("currentRotation", currentRotation+360*4)
    return d3.interpolateString("rotate("+currentRotation+")", "rotate("+(currentRotation+360*4)+")");
  };
}
