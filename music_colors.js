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
	var defaultMargin = wheelDiv.clientWidth*0.02;
	margin = {
			top: defaultMargin,
			right: defaultMargin,
			bottom: wheelDiv.clientHeight*0.15,
			left: defaultMargin
		};
	height = d3.min([wheelDiv.clientHeight - margin.top - margin.bottom,
		 wheelDiv.clientWidth - margin.left - margin.right]),
	width = height;
	songsPerCircle = 45;
	svg = d3.select("#wheel-container").append("svg")
		.attr("width", (width + margin.left + margin.right))
		.attr("height", (height + margin.top + margin.bottom))
		.append("g")
		.attr("transform", "translate(" +(width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");
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
		wheelSvg : wheelSvg,
		songInfoHTMLCreated : false,
		artistClicked : false,
	};

	d3.csv('small_colors_songs_withSpotify.csv')
	  .then(function(data) {
				createContext(globalParameters, data);

				drawSmallMiddleCircle(globalParameters);

				drawSongTiles(data, globalParameters);

				showGeneralInfo(globalParameters);

				drawGenresButtons(data, globalParameters);
	  })
	  .catch(function(error){
			console.log(error);
	  })

});

function drawGenresButtons(filteredData, globalParameters) {
	var allGenre = filteredData.map(function(d) {
  		return {
    		genre: d.general_genre,
  		}
	});
	var counts = {};
	for(var i = 0; i < allGenre.length; i++) {
		var word = allGenre[i].genre;
		if (word === "") {
			continue;
		}
		if(counts[word] === undefined) {
			counts[word] = 1;
		}
		else {
			counts[word] += 1;
		}
	}

	var items = Object.keys(counts).map(function(key) {
  		return [key, counts[key]];
	});
	items.sort(function(first, second) {
  		return second[1] - first[1];
	});
	items = items.map(function(d) {
		return d[0];
	});
	var mostFrequentGenre = items.slice(0, 5);

	d3.select("#left-panel")
		.selectAll("input")
		.remove();


	var printedGenre = ""; //Le toggle pour le boutton
	//Simplement on va regarder si le genre clické est le meme, si c'est le meme ca veut dire qu'on doit
	//tout remettre a 0 quand on reclick dessus.
	//Y'avais un pb quand on selectionnais une musique et qu'ensuite on cliquait sur un genre, c'est réglé
	//en placant bien showGeneralInfo ou il faut
	
	d3.select("#left-panel")
		.selectAll("input")
		.data(mostFrequentGenre)
		.enter()
		.append("input")
		.attr("type", "button")
		.attr("id", "btn")
		.attr("value", function (d) {
			return d;
		}).on('click', function(d) {
			showGeneralInfo(globalParameters);
			if(printedGenre == d) { // This means here that we want to turn off the current genre selected.
				showGeneralInfo(globalParameters);
				printedGenre = "";
				return;
			}
			else {
			 d3.selectAll(".song").classed("unhighlight-genre", function(d2) {
			 	printedGenre = d;
			 	return d2.general_genre !== d;
			 })	
			}	 
		 })
	// Boutton pour l'histograme en d3 plutot que en html

	var currentPlot = "vynil"; //pareil que l'histoire du toggle dans les genres

	d3.select("#left-panel")
		.append("input")
		.attr("type", "button")
		.attr("value", "Histogram")
		.classed("button_histo", true)
		.classed("button_plain", true)
		.on('click', function(d) {
			// Ici Histograme. A voir comment modulariser, peut etre que c'est mieux de faire un fichier different ?
			d3.select(this).attr("value", "Vynil");
			d3.select("#wheelSvg")
				.transition()
				.duration(1000)
				.style("opacity", 0)
				.remove();
			document.getElementById("wheel-container").style["background"] = "#e0d0c4"; // plus de sens d'avoir un dégradé radial
			drawHistogram(filteredData, globalParameters);
		})
		
}

function drawHistogram(filteredData, globalParameters){
	d3.select("#wheel-container").selectAll("wheelSvg").remove();
	svg = d3.select("#wheel-container").select("svg");
	svg.attr('transform', null);	
	histoSvg = svg.append("g").attr("id", "histoSvg");
	histoSvg.attr("transform", "translate(" +(globalParameters.margin.left) + "," + (globalParameters.margin.top) + ")");

	histoSvg.append('rect').attr('width', globalParameters.width).attr('height', globalParameters.height);

	//Construct the histogram
	var x = d3.scaleLinear()
		.domain([globalParameters.filters.yearLimitLow, globalParameters.filters.yearLimitHigh])
		.range(0, globalParameters.width);

	var y = d3.scaleLinear()
		.domain([0, 1000])
		.range(0, 200); // A definir ici avec la data le maximum count

	drawHistogramTiles(filteredData, globalParameters)

}

function drawHistogramTiles(filteredData, globalParameters){
	console.log("Draw tiles now!")
}

function showGeneralInfo(globalParameters){
	//removing all other classes to songs (seleceted-song, unslected-song ....)
	d3.selectAll(".song").attr("class", "song");

	songInfoContainer = d3.select("#song-info-container");
	songInfoContainer.selectAll("*").remove();
	globalParameters.songInfoHTMLCreated = false;
	generalInfoContainer = songInfoContainer.append("div").attr("id", "general-info");

	generalInfoContainer.append("center").append("h2").text("The Color of Songs");
	generalInfoContainer.append("p").text("You are currently seeing a subset of top 100 songs from "+globalParameters.filters.yearLimitLow+" to "+globalParameters.filters.yearLimitHigh+".");
	generalInfoContainer.append("p").text("A song is shown on this visualization if its lyrics contain a color word.");
	generalInfoContainer.append("p").text("You can click on a song to get more details about it.");
	generalInfoContainer.append("p").text("You can also select a custom time range on the time scale at the bottom.");
	generalInfoContainer.append("p").text("You can toggle the filters on the left to show only some music genres.");

	generalInfoContainer.append("p").text("This is a project for the Data visualization course thought at EPFL in 2021.");
	generalInfoContainer.append("p").text("Authors : Alexander Apostolov, Valentin Garnier and Maina Orchampt-Mareschal");
}

function createSongInfoHTML(song, globalParameters){
	songInfoContainer = d3.select("#song-info-container");
	songInfoContainer.selectAll("*").remove();

	closeButton = songInfoContainer.append("div").classed("close-container", true);
	closeButton.append("div").classed("leftright", true);
	closeButton.append("div").classed("rightleft", true);
	closeButton.append("label").classed("close", true).text("close");
	closeButton.on("click", function(){
		showGeneralInfo(globalParameters);
	});

	generalInfoDiv = songInfoContainer.insert("div").attr("id", "general-info-song");
	lyricsDiv = songInfoContainer.insert("div").attr("id", "song-info-lyrics");

	//generalInfoDiv.append("center").append("h2").text("Song info");
	generalInfoDiv.append("center").append("h2").attr("id", "song-info-name");
	generalInfoDiv.append("p").text("Artist: ").append("em").attr("id", "song-info-artist");
	generalInfoDiv.append("p").text("Genre: ").append("em").attr("id", "song-info-genre");
	generalInfoDiv.append("p").text("Year: ").append("em").attr("id", "song-info-year");
	generalInfoDiv.append("p").text("Ranking: ").append("em").attr("id", "song-info-position");
	generalInfoDiv.append("iframe").attr("id", "spotify-player").attr("src", "")
		.attr("width", "300").attr("height", "80").attr("frameborder", "0")
		.attr("allowtransparency", "true").attr("allow", "encrypted-media");

	lyricsDiv.append("center").append("h3").text("Lyrics");
	lyricsDiv.append("div").attr("id", "lyrics-container").style({'font-family': "palatino"});
	globalParameters.artistClicked = false;
}

function showSongInformation(song, globalParameters){
	if (!globalParameters.songInfoHTMLCreated){
		createSongInfoHTML(song, globalParameters);
	}
	const song_name = document.getElementById("song-info-name");
	const song_artist = document.getElementById("song-info-artist");
	const song_genre = document.getElementById("song-info-genre");
	const song_position = document.getElementById("song-info-position");
	const song_year = document.getElementById("song-info-year");
	const song_lyrics = document.getElementById("lyrics-container");
	const spotify_player = document.getElementById("spotify-player");
	song_name.innerHTML = song.title;
	song_artist.innerHTML = song.artist;

	if (globalParameters.artistClicked){
		if(!(d3.select(".selected-song").attr("artist") === song.artist)){
			globalParameters.artistClicked = false;
			d3.selectAll(".song").classed("same-artist", false);
		} else {
			var currentlySelectedArtist = song.artist;
			d3.selectAll(".song").classed("same-artist", function(d){
				return d.artist === currentlySelectedArtist;
			})
		}
	}

	d3.select("#song-info-artist")
	.on("click", function(){
		globalParameters.artistClicked = !globalParameters.artistClicked;
		if (globalParameters.artistClicked){
			var currentlySelectedArtist = song.artist;
			d3.selectAll(".song").classed("same-artist", function(d){
				return d.artist === currentlySelectedArtist;
			})
		}
		d3.select(this).classed("clicked-artist", globalParameters.artistClicked);
	})
	.on("mouseover", function(){
		if (!globalParameters.artistClicked){
			var currentlySelectedArtist = song.artist;
			d3.selectAll(".song").classed("same-artist", function(d){
				return d.artist === currentlySelectedArtist;
			})
		}
	})
	.on("mouseout", function(){
		if (!globalParameters.artistClicked){
			d3.selectAll(".song").classed("same-artist", false);
		}
	})
	.classed("clicked-artist", globalParameters.artistClicked);

	song_position.innerHTML = song.pos;
	song_year.innerHTML = song.year;
	//updating the Spotify play button only if there is no other one yet or if there is one it is another song
	//(so that music is not interrupted if user clicked on same song)
	if (! globalParameters.songInfoHTMLCreated){
		spotify_player.src = "https://open.spotify.com/embed/track/" + song.spotify_uri;
	} else {
		currentlyShownMusic = d3.select(".selected-song").attr("spotify_uri");
		if(currentlyShownMusic !== song.spotify_uri){
			spotify_player.src = "https://open.spotify.com/embed/track/" + song.spotify_uri;
		}
	}


	var tags = song.tags.replace(/"/g, '').replace(/'/g, '"');
	var parsed_tags = JSON.parse(tags);
	song_genre.innerHTML = (parsed_tags.length > 1) ? parsed_tags[0] +" "+ parsed_tags[1] : parsed_tags[0];

	song_lyrics.innerHTML = song.preprocessed_lyrics;
	song_lyrics.style.fontFamily = "Palatino";

	var offset = getOffsetOfFirstColoredWord();
	song_lyrics.scroll(0, offset);
	globalParameters.songInfoHTMLCreated = true;
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
				var filteredData = filterData(data, globalParameters);
				drawGenresButtons(filteredData, globalParameters);
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
		 .attr("spotify_uri", function(d){
			 return d.spotify_uri;
		 })
		 .attr("artist", function(d){
			 return d.artist;
		 })
		 .attr("genre", function(d) {
		 	return d.general_genre;
		 })
		 .style("fill", function(d, i) {
			 return 'transparent';
		 })
		 .on('mouseover', function(d, i) {
			 d3.select(this).classed('hovered-song', true);
		 })
		 .on('mouseout', function(d) {
			 d3.select(this).classed('hovered-song', false);
		 })
		 .on('click', function(d) {
			 showSongInformation(d, globalParameters);
			 //uncclass previous selected-song, unselected-song etc...
			 d3.selectAll(".song").classed("selected-song", false).attr("unselected-song", false);
			 d3.selectAll(".song").classed("unhighlight-genre", false);

			 //add class selected-song to the clicked tile
			 current_song_id = d.spotify_uri;
			 d3.selectAll(".song").classed("unselected-song", function(d) { return d.spotify_uri !== current_song_id; })
			 d3.select(this).classed("selected-song", true);
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
			showGeneralInfo(globalParameters);
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
