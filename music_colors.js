
/**
 * whenDocumentLoaded - Fires the given action when the DOM has finished loading.
 *
 * @param   action function
 * @return  None
 */
function whenDocumentLoaded(action) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", action);
    } else {
        action();
    }
}


/**
 * Main piece of code for our website
 * Generates the global parameters and
 * calls the initial visualization of the vinyl.
 */
whenDocumentLoaded(() => {
    const wheelDiv = document.getElementById("wheel-container");

    //global parameters
    //1. prepare the global parameters
    var defaultMargin = wheelDiv.clientWidth * 0.02;
    margin = {
        top: defaultMargin,
        right: defaultMargin,
        bottom: wheelDiv.clientHeight * 0.15,
        left: defaultMargin
    };
    height = d3.min([wheelDiv.clientHeight - margin.top - margin.bottom,
            wheelDiv.clientWidth - margin.left - margin.right
        ]),
        width = height;
    songsPerCircle = 45;
    svg = d3.select("#wheel-container").append("svg")
        .attr("width", (width + margin.left + margin.right))
        .attr("height", (height + margin.top + margin.bottom))
        .append("g");

    //2. Store them in a dict
    var globalParameters = {
        defaultMargin: defaultMargin,
        margin: margin,
        height: height,
        width: width,
        centerWheelRadius: height * 0.17,
        songsPerCircle: songsPerCircle,
        angleArcPerSong: Math.PI * 2 / songsPerCircle,
        outterRadius: d3.min([width, height]) / 2,
        smallMiddleCircleRadius: height * 0.01,
        redrawTime: 500,
        contextHeight: height * 0.05,
        contextWidth: width,
        filters: {
            yearLimitLow: 1951,
            yearLimitHigh: 2015
        },
        arcGenerator: d3.arc(),
        svg: svg,
        wheelSvg: null,
        histoSvg: null,
        songInfoHTMLCreated: false,
        artistClicked: false,
        printedGenre: '',
        currentPlot: 'vinyl'
    };

    drawWholeVinyl(globalParameters);
    drawVinylHistogramButton(globalParameters);

    //if user presses Q, removes all selection from genres or song or artist
    d3.select('body').on("keypress", function() {
        if (d3.event.keyCode === 113) {
          globalParameters.printedGenre = "";
          d3.selectAll('.genre-btn').classed("clicked-btn", false);
          showGeneralInfo(globalParameters);
        }
    })
});


/**
 * prepareMainSvgForVinyl - Prepares the main SVG for the vinyl to be drawn
 * by setting the translate to be in the middle of the circle that is going
 * to be drawn.
 *
 *
 * @param  {dict} globalParameters Dictionary with all global parameters.
 * @return None
 */
function prepareMainSvgForVinyl(globalParameters) {
    globalParameters.svg.attr("transform", "translate(" +
        (globalParameters.width / 2 + globalParameters.margin.left) +
        "," + (globalParameters.height / 2 + globalParameters.margin.top) + ")");
}


/**
 * drawWholeVinyl - Draws the vinyl with initial parameters and no selection.
 *
 * @param  {dict} globalParameters Dictionary with all global parameters.
 * @return None
 */
function drawWholeVinyl(globalParameters) {

    //reset year filters to initial when new vinyl is drawn
    globalParameters.filters = {
        yearLimitLow: 1951,
        yearLimitHigh: 2015
    }
    //removes the histogram.
    d3.selectAll("#histoSvg").remove();
    globalParameters.histoSvg = null;

    prepareMainSvgForVinyl(globalParameters);
    wheelSvg = svg.append("g")
        .attr("id", "wheelSvg");

    globalParameters.wheelSvg = wheelSvg;

    d3.csv('csv_files/final_songs_withSpotify.csv')
        .then(function(data) {
            drawSmallMiddleCircle(globalParameters);

            drawSongTiles(data, globalParameters);

            createContext(globalParameters, data);

            showGeneralInfo(globalParameters);

            drawGenresButtons(data, globalParameters);
        })
        .catch(function(error) {
            console.log(error);
        })
}


/**
 * drawGenresButtons - Draws the genre buttons for the top 5 main genres of the
 * current year selection.
 *
 * @param         filteredData     The filtered data that will be drawn.
 * @param  {dict} globalParameters Dictionary with all global parameters.
 * @return None
 */
function drawGenresButtons(filteredData, globalParameters) {
    //counting the genres in the current filtered data
    var allGenre = filteredData.map(function(d) {
        return {
            genre: d.general_genre,
        }
    });
    var counts = {};
    for (var i = 0; i < allGenre.length; i++) {
        var genre_name = allGenre[i].genre;
        if (genre_name === "Unknown") {
            continue;
        } else if (counts[genre_name] === undefined) {
          //new genre to add in the dictionary
            counts[genre_name] = 1;
        } else {
            counts[genre_name] += 1;
        }
    }

    //Get the pairs of genres and counts and sort them according to the counts.
    var items = Object.keys(counts).map(function(key) {
        return [key, counts[key]];
    });
    items.sort(function(first, second) {
        return second[1] - first[1];
    });
    items = items.map(function(d) {
      //capitalize first letter of genres
        return d[0].charAt(0).toUpperCase() + d[0].substr(1);
    });

    //Get the top 5 genres
    var mostFrequentGenre = items.slice(0, 6);

    //removing previous genre buttons
    d3.select("#left-panel")
        .selectAll(".genre-btn")
        .remove();

    // The selected genre is in global parameters, we can use this to know
    // when to toggle or untoggle the genre.

    d3.select("#left-panel")
        .selectAll("input")
        .data(mostFrequentGenre)
        .enter()
        .append("input")
        .attr("type", "button")
        .attr("id", "btn")
        .attr("class", "genre-btn")
        .attr("value", function(d) {
            return d;
        }).on('click', function(d) {
            showGeneralInfo(globalParameters);
            if (globalParameters.printedGenre == d.toLowerCase()) {
              // This means here that we want to turn off the current genre selected.
                showGeneralInfo(globalParameters);
                globalParameters.printedGenre = "";
                d3.select(this).classed("clicked-btn", false);
            } else {
              //Toggle the current genre.
                d3.selectAll(".genre-btn").classed("clicked-btn", false);
                d3.select(this).classed("clicked-btn", true);

                if (globalParameters.currentPlot === 'vinyl') {
                    d3.selectAll(".song").classed("unhighlight-genre", function(d2) {
                        globalParameters.printedGenre = d.toLowerCase();
                        return d2.general_genre !== d.toLowerCase();
                    })
                } else {
                    d3.selectAll(".song-rect").classed("unhighlight-genre", function(d2) {
                        globalParameters.printedGenre = d.toLowerCase();
                        return d2.general_genre !== d.toLowerCase();
                    })
                }
            }
        })
}


/**
 * drawVinylHistogramButton - Draws the button to change between the vinyl and
 *  the histogram.
 *
 * @param  {dict} globalParameters Dictionary with all global parameters.
 */
function drawVinylHistogramButton(globalParameters) {

    d3.select("#left-panel")
        .append("input")
        .attr("type", "button")
        .attr("value", "Histogram")
        .classed("button_histo", true)
        .classed("button_plain", true)
        .on('click', function(d) {
          //when switching, remove selected genre.
            globalParameters.printedGenre = '';
            if (globalParameters.currentPlot === "vinyl") {
              //vinyl -> histogram
                d3.select(this).attr("value", "Vinyl");
                globalParameters.currentPlot = "histo";
                d3.select("#wheel-container").style("background", "#c9af9d");
                drawHistogram(globalParameters);
            } else {
              //histogram -> vinyl
                d3.select(this).attr("value", "Histogram");
                globalParameters.currentPlot = "vinyl";
                d3.select("#wheel-container")
                  .style("background", "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(201,175,157,1) 20%)");
                d3.select("#wheel-container").style("background-position", "0px -50px");
                drawWholeVinyl(globalParameters);
            }

        })
}


/**
 * prepareMainSvgForHistogram - Prepares the main SVG for the histogram by removing
 * the transform.
 *
 * @param  {dict} globalParameters Dictionary with all global parameters.
 * @return None
 */
function prepareMainSvgForHistogram(globalParameters) {
    globalParameters.svg.attr("transform", null);
}


/**
 * drawHistogram - Draws the Histogram of all songs.
 *
 * @param  {dict} globalParameters Dictionary with all global parameters.
 * @return None
 */
function drawHistogram(globalParameters) {
    //reset year filters to initial when new vinyl is drawn
    globalParameters.filters = {
        yearLimitLow: 1951,
        yearLimitHigh: 2015
    }

    d3.selectAll("#wheelSvg").remove();
    globalParameters.wheelSvg = null;
    d3.select(".context").remove();

    prepareMainSvgForHistogram(globalParameters);

    histoSvg = globalParameters.svg.append("g").attr("id", "histoSvg")
        .attr("transform", "translate(" + (globalParameters.margin.left) + "," + (globalParameters.margin.top) + ")")
        .attr('width', globalParameters.width)
        .attr('height', globalParameters.height)

    globalParameters.histoSvg = histoSvg;


    d3.csv('csv_files/final_songs_withSpotify.csv')
        .then(function(data) {
            //Construct the histogram

            //we want each song to be a square so we must find what is the biggest
            //size we can use according to the height and width
            const max_available_width = (globalParameters.width - globalParameters.margin.right) - globalParameters.margin.left;
            const number_years = globalParameters.filters.yearLimitHigh - globalParameters.filters.yearLimitLow + 1;
            const max_available_square_width = max_available_width / number_years;

            const max_available_height = (globalParameters.height - globalParameters.margin.top);
            const index_in_year_extent = d3.extent(data, function(d_element) {
                return +d_element.index_in_year;
            });
            const max_number_songs_in_a_year = index_in_year_extent[1] + 1;
            const max_available_square_height = max_available_height / max_number_songs_in_a_year;

            const square_size = d3.min([max_available_square_width, max_available_square_height]);

            const x_range_size = square_size * number_years;
            const y_range_size = square_size * max_number_songs_in_a_year;


            const x = d3.scaleLinear()
                .domain([globalParameters.filters.yearLimitLow, globalParameters.filters.yearLimitHigh])
                .range([globalParameters.margin.left, globalParameters.margin.left + x_range_size]);


            const y = d3.scaleLinear()
                .domain(index_in_year_extent)
                //range is reversed so that it grows from the bottom upwards
                .range([globalParameters.height, globalParameters.height - y_range_size]);

            drawHistogramTiles(data, globalParameters, x, y, square_size);

            showGeneralInfo(globalParameters);

            drawGenresButtons(data, globalParameters);
        })
        .catch(function(error) {
            console.log(error);
        })
}


/**
 * drawHistogramTiles - Draws all histogram tiles.
 *
 * @param                   filteredData      The filtered data to be rawn.
 * @param  {dict}           globalParameters  Dictionary with all global parameters.
 * @param  {d3.scaleLinear} x                 Linear scale for the x axis.
 * @param  {d3.scaleLinear} y                 Linear scale for the y axis.
 * @param  {float}          square_size       The size of a tile.
 * @return None
 */
function drawHistogramTiles(filteredData, globalParameters, x, y, square_size) {
    //we use 2.5% for margins on all borders
    const square_size_without_margins = square_size * 0.95;
    d3.select("#histoSvg")
        .selectAll(".song-rect")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr('class', 'song-rect')
        .attr("x", d => x(parseFloat(d.year)))
        .attr("y", d => y(+d.index_in_year))
        .attr("width", square_size_without_margins)
        .attr("height", square_size_without_margins)
        .attr("spotify_uri", function(d) {
            return d.spotify_uri;
        })
        .attr("artist", function(d) {
            return d.artist;
        })
        .attr("genre", function(d) {
            return d.general_genre.toLowerCase();
        })
        .style("fill", function(d, i) {
            return 'transparent';
        })
        .style("stroke", null)
        .on('mouseover', function(d, i) {
            d3.select(this).classed('hovered-song', true);
        })
        .on('mouseout', function(d) {
            d3.select(this).classed('hovered-song', false);
        })
        .on('click', function(d) {
            showSongInformation(d, globalParameters);
            //uncclass previous selected-song, unselected-song etc...
            d3.selectAll(".song-rect").classed("selected-song", false).attr("unselected-song", false);
            d3.selectAll(".song-rect").classed("unhighlight-genre", false);

            //add class selected-song to the clicked tile
            current_song_id = d.spotify_uri;
            d3.selectAll(".song-rect").classed("unselected-song", function(d) {
                return d.spotify_uri !== current_song_id;
            });
            d3.select(this).classed("selected-song", true);
        })
        .transition()
        .duration(30)
        .delay(function(d, i) {
            return i * globalParameters.redrawTime / filteredData.length;
        })
        .style("fill", function(d, i) {
            return d.random_rgb;
        });

    //X axis of the histogram
    var x_axis = d3.axisBottom().scale(x).tickFormat(d3.format("d"));
    histoSvg.append("text")
        .attr("transform",
            "translate(" + (globalParameters.width / 2) + " ," +
            (globalParameters.height + square_size * 6) + ")")
        .style("text-anchor", "middle")
        .text("Year");

    histoSvg.append("g").attr("transform",
        "translate(" + (square_size / 2) + ", " + (globalParameters.height + square_size * 1.3) + ")").call(x_axis);
}


/**
 * showGeneralInfo - Shows the general info when no song is selected.
 *
 * @param  {dict} globalParameters Dictionary with all global parameters.
 * @return None
 */
function showGeneralInfo(globalParameters) {
    //removing all other classes to songs (seleceted-song, unslected-song ....)
    d3.selectAll(".song").attr("class", "song");

    d3.selectAll(".song-rect").attr("class", "song-rect");

    songInfoContainer = d3.select("#song-info-container");
    songInfoContainer.selectAll("*").remove();
    globalParameters.songInfoHTMLCreated = false;
    generalInfoContainer = songInfoContainer.append("div").attr("id", "general-info");

    generalInfoContainer.append("center").append("h2").text("The Color of Songs");
    generalInfoContainer.append("p").text("You are currently seeing a subset of top 100 songs from " + globalParameters.filters.yearLimitLow + " to " + globalParameters.filters.yearLimitHigh + ".");
    generalInfoContainer.append("p").text("A song is shown on this visualization if its lyrics contain a color word.");
    generalInfoContainer.append("p").text("You can click on a song to get more details about it.");
    if (globalParameters.currentPlot === 'vinyl') {
        generalInfoContainer.append("p").text("You can also select a custom time range on the time scale at the bottom.");
        generalInfoContainer.append("p").text("If you have selected a specific time range and want to come back to the whole time range, just double-click on your selection.");
    }

    generalInfoContainer.append("p").text("You can toggle the filters on the left to show only some music genres.");


    usContainer = songInfoContainer.append("div").attr('id', 'about-us-container');
    usContainer.html('<p>This is a project for the <a href="https://edu.epfl.ch/' +
        'coursebook/en/data-visualization-COM-480">Data visualization course</a> thou' +
        'ght at <a href="https://www.epfl.ch/en/">EPFL</a> in 2021.</p><p>Authors : ' +
        '<a href="https://alexander-apostolov.com/">Alexander Apostolov</a>, <a' +
        ' href="https://www.valentingarnier.com/">Valentin Garnier</a> and <a ' +
        'href="https://www.linkedin.com/in/maina-orchampt-mareschal">Maina ' +
        'Orchampt-Mareschal</a></p>');
}


/**
 * createSongInfoHTML - Creates the HTML elements that are used for displaying
 * song information.
 *
 * @param  {dict} globalParameters Dictionary with all global parameters.
 * @return None
 */
function createSongInfoHTML(globalParameters) {
    songInfoContainer = d3.select("#song-info-container");
    songInfoContainer.selectAll("*").remove();

    //close button
    closeButton = songInfoContainer.append("div").classed("close-container", true);
    closeButton.append("div").classed("leftright", true);
    closeButton.append("div").classed("rightleft", true);
    closeButton.append("label").classed("close", true).text("close");
    closeButton.on("click", function() {
        showGeneralInfo(globalParameters);
    });

    generalInfoDiv = songInfoContainer.insert("div").attr("id", "general-info-song");
    lyricsDiv = songInfoContainer.insert("div").attr("id", "song-info-lyrics");

    generalInfoDiv.append("center").append("h2").attr("id", "song-info-name");
    generalInfoDiv.append("p").text("Artist: ").append("em").attr("id", "song-info-artist");
    generalInfoDiv.append("p").text("Genre: ").append("em").attr("id", "song-info-genre");
    generalInfoDiv.append("p").text("Year: ").append("em").attr("id", "song-info-year");
    generalInfoDiv.append("p").text("Ranking: ").append("em").attr("id", "song-info-position");
    generalInfoDiv.append("iframe").attr("id", "spotify-player").attr("src", "")
        .attr("width", "300").attr("height", "30%").attr("frameborder", "0")
        .attr("allowtransparency", "true").attr("allow", "encrypted-media");

    lyricsDiv.append("center").append("h3").text("Lyrics");
    lyricsDiv.append("div").attr("id", "lyrics-container").style({
        'font-family': "palatino"
    });
    globalParameters.artistClicked = false;
    globalParameters.printedGenre = '';
    d3.selectAll(".genre-btn").classed("clicked-btn", false);
}


/**
 * showSongInformation - Adds the specific information for the given song to
 * the song information pannel.
 *
 * @param         song             Given song to show.
 * @param  {dict} globalParameters Dictionary with all global parameters.
 * @return None
 */
function showSongInformation(song, globalParameters) {
    if (!globalParameters.songInfoHTMLCreated) {
        createSongInfoHTML(globalParameters);
    }
    const song_name = d3.select("#song-info-name");
    const song_artist = d3.select("#song-info-artist");
    const song_genre = d3.select("#song-info-genre");
    const song_position = d3.select("#song-info-position");
    const song_year = d3.select("#song-info-year");
    const song_lyrics = d3.select("#lyrics-container");
    const spotify_player = d3.select("#spotify-player");
    const detected_color = song.color;
    song_name.text(song.title);
    song_artist.text(song.artist);

    //if an artist was previously selected, continues showing all songs of the artist
    // if the selected song is from the same artist, otherwise unselectes the artist
    if (globalParameters.artistClicked) {
        if (!(d3.select(".selected-song").attr("artist") === song.artist)) {
            globalParameters.artistClicked = false;
            d3.selectAll(".song").classed("same-artist", false);
            d3.selectAll(".song-rect").classed("same-artist", false);

        } else {
            var currentlySelectedArtist = song.artist;
            d3.selectAll(".song").classed("same-artist", function(d) {
                return d.artist === currentlySelectedArtist;
            })
            d3.selectAll(".song-rect").classed("same-artist", function(d) {
                return d.artist === currentlySelectedArtist;
            })
        }
    }

    //if the user hovers or clicks on the artist, all songs from the same
    //  artist are highlighted
    d3.select("#song-info-artist")
        .on("click", function() {
            globalParameters.artistClicked = !globalParameters.artistClicked;
            if (globalParameters.artistClicked) {
                var currentlySelectedArtist = song.artist;
                d3.selectAll(".song").classed("same-artist", function(d) {
                    return d.artist === currentlySelectedArtist;
                })
                d3.selectAll(".song-rect").classed("same-artist", function(d) {
                    return d.artist === currentlySelectedArtist;
                })
            }
            d3.select(this).classed("clicked-artist", globalParameters.artistClicked);
        })
        .on("mouseover", function() {
            if (!globalParameters.artistClicked) {
                var currentlySelectedArtist = song.artist;
                d3.selectAll(".song").classed("same-artist", function(d) {
                    return d.artist === currentlySelectedArtist;
                })
                d3.selectAll(".song-rect").classed("same-artist", function(d) {
                    return d.artist === currentlySelectedArtist;
                })
            }
        })
        .on("mouseout", function() {
            if (!globalParameters.artistClicked) {
                d3.selectAll(".song").classed("same-artist", false);
                d3.selectAll(".song-rect").classed("same-artist", false);
            }
        })
        .classed("clicked-artist", globalParameters.artistClicked);

    song_position.text(song.pos);
    song_year.text(song.year);

    //updating the Spotify play button only if there is no other one yet or if there is one it is another song
    //(so that music is not interrupted if user clicked on same song)
    if (!globalParameters.songInfoHTMLCreated) {
        spotify_player.attr('src', "https://open.spotify.com/embed/track/" + song.spotify_uri);
    } else {
        currentlyShownMusic = d3.select(".selected-song").attr("spotify_uri");
        if (currentlyShownMusic !== song.spotify_uri) {
            spotify_player.attr('src', "https://open.spotify.com/embed/track/" + song.spotify_uri);
        }
    }

    var song_general_genre = song.general_genre;
    song_genre.text(song_general_genre);

    song_lyrics.html(song.preprocessed_lyrics);
    //scrolling the lyrics to the first appearance of a colored word
    var offset = getOffsetOfFirstColoredWord(detected_color);
    song_lyrics.node().scroll(0, offset);
    globalParameters.songInfoHTMLCreated = true;
}


/**
 * getOffsetOfFirstColoredWord - Gets teh offset of the first occurence of the
 * word of the given color in order to use it to scroll the lyrics.
 *
 * @param  {str}  color   Color word to find.
 * @return {float}        Offset of the first apearance of  a colored word of
 *                        the given color.
 */
function getOffsetOfFirstColoredWord(color) {
    var parentPos = d3.select('.' + color + '_word').node().parentNode.getBoundingClientRect(),
        childPos = d3.select('.' + color + '_word').node().getBoundingClientRect();

    var offset = childPos.top - parentPos.top;
    return offset
}


/**
 * filterData - Filters the whole data based on a time range
 * in the global parameters.
 *
 * @param         data             All the data of songs.
 * @param  {dict} globalParameters Dictionary with all global parameters.
 * @return                         The filtered data.
 */
function filterData(data, globalParameters) {
    return data.filter(function(row) {
        if ((globalParameters.filters.yearLimitLow <= row.year) && (row.year <= globalParameters.filters.yearLimitHigh)) {
            return true;
        } else {
            return false;
        }
    });
}


/**
 * reDrawCircle - Redraws the vinyl, to be used when another time range
 * is selected.
 *
 * @param  {dict} globalParameters Dictionary with all global parameters.
 * @return None
 */
function reDrawCircle(globalParameters) {
    globalParameters.printedGenre = '';

    //Previous vinyl fades out
    d3.selectAll(".genre-btn").classed("clicked-btn", false);
    d3.select("#wheelSvg")
        .selectAll(".song")
        .attr("class", "removedSongs")
        .transition()
        .duration(1000)
        .style("opacity", 0)
        .remove();

    //draw new vinyl
    d3.csv('csv_files/final_songs_withSpotify.csv')
        .then(function(data) {
            var filteredData = filterData(data, globalParameters);
            drawGenresButtons(filteredData, globalParameters);
            drawSongTiles(filteredData, globalParameters);
        }).catch(function(error) {
            console.log(error);
        })
}


/**
 * drawSongTiles - Draws all the song tiles in the vinyl.
 *
 * @param         filteredData     Data to be shown.
 * @param  {type} globalParameters Dictionary with all global parameters.
 * @return None
 */
function drawSongTiles(filteredData, globalParameters) {
    //number of circles with at least a tile
    var numberCircles = Math.ceil(filteredData.length / globalParameters.songsPerCircle);
    //number of tiles on the inner most circle that can be incomplete
    var songsLastCircle = (filteredData.length - 1) % globalParameters.songsPerCircle + 1;

    var circleWidth = (globalParameters.outterRadius - globalParameters.centerWheelRadius) / numberCircles;
    var filledCircleWidth = 0.7 * circleWidth;
    var spaceBetweenCircles = circleWidth - filledCircleWidth;

    //number of songs that are on the radiuses with all circles
    var idxOnAllCircles = songsLastCircle * numberCircles;
    //angle from which not all circles are unused
    var offsetAngle = songsLastCircle * globalParameters.angleArcPerSong;

    var path = d3.select("#wheelSvg")
        .selectAll(".song")
        .data(filteredData)
        .enter().append("path")
        .attr('class', 'song')
        .attr("d", function(d, index) {
            if (index < idxOnAllCircles) {
                var startAngle = globalParameters.angleArcPerSong * Math.floor(index / numberCircles);
                var startRadius = globalParameters.centerWheelRadius + spaceBetweenCircles +
                    circleWidth * (index % numberCircles);
            } else {
                var offset = index - idxOnAllCircles;
                var startAngle = offsetAngle + globalParameters.angleArcPerSong * Math.floor(offset / (numberCircles - 1));
                var startRadius = globalParameters.centerWheelRadius + circleWidth +
                    spaceBetweenCircles + circleWidth * (index % (numberCircles - 1));
            };
            return globalParameters.arcGenerator({
                startAngle: startAngle,
                endAngle: startAngle + globalParameters.angleArcPerSong,
                innerRadius: startRadius,
                outerRadius: startRadius + filledCircleWidth
            });
        })
        .attr("spotify_uri", function(d) {
            return d.spotify_uri;
        })
        .attr("artist", function(d) {
            return d.artist;
        })
        .attr("genre", function(d) {
            return d.general_genre.toLowerCase();
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
            d3.selectAll(".song").classed("unselected-song", function(d) {
                return d.spotify_uri !== current_song_id;
            })
            d3.select(this).classed("selected-song", true);
        })
        .transition()
        .duration(30)
        .delay(function(d, i) {
            return i * globalParameters.redrawTime / filteredData.length;
        })
        .style("fill", function(d, i) {
            return d.random_rgb;
        })
}


/**
 * drawSmallMiddleCircle - Drwas the small middle circle in the middle
 * of the vinyl.
 *
 * @param  {dict} globalParameters Dictionary with all global parameters.
 * @return None
 */
function drawSmallMiddleCircle(globalParameters) {
    globalParameters.wheelSvg.append("circle")
        .attr("class", "center-wheel")
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', globalParameters.smallMiddleCircleRadius)
        .style('fill', "transparent")
        .style('stroke', 'black');
}


/**
 * createContext - Creates the brushable context below the vinyl.
 *
 * @param  {dict} globalParameters Dictionary with all global parameters.
 * @param         data             All the song data (unfiltered).
 * @return None
 */
function createContext(globalParameters, data) {
    // Create a context for a brush
    let context = globalParameters.svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + (-globalParameters.width / 2) + "," + (globalParameters.height / 2 + globalParameters.defaultMargin * 2) + ")");


    var contextXScale = d3.scaleTime()
        .range([0, globalParameters.contextWidth])
        .domain(d3.extent(data.map(function(d) {
            return new Date(+d.year, 0, 1);
        })));

    xAxis = g => g
        .attr("transform", `translate(0,${globalParameters.contextHeight})`)
        .call(g => g.append("g")
            .call(d3.axisBottom(contextXScale)
                .ticks(d3.timeYear.every(1))
                .tickSize(-globalParameters.contextHeight)
                .tickFormat((interval, i) => {
                    return interval.getFullYear() % 5 !== 0 ?
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
        .extent([
            [0, 0],
            [globalParameters.contextWidth, globalParameters.contextHeight]
        ])
        .on("brush", brushed)
        .on("end", brushended);

    context.append("g")
        .call(xAxis);

    context.append("g")
        .call(brush)
        .on("dblclick", dblclicked);

    function brushed() {
        const selection = d3.event.selection;
        if (!d3.event.sourceEvent || !selection) return;
        const [x0, x1] = selection.map(d => contextXScale.invert(d));
    }

    //Clips the selection to exact years
    function brushended() {
        const selection = d3.event.selection;
        if (!d3.event.sourceEvent || !selection) return;
        const [x0, x1] = selection.map(d => d3.timeYear.round(contextXScale.invert(d)));
        d3.select(this).transition().call(brush.move, x1 > x0 ? [x0, x1].map(contextXScale) : null);

        new_x0 = x0.getFullYear();
        new_x1 = x1.getFullYear();

        if ((new_x0 !== globalParameters.filters.yearLimitLow) | (new_x1 !== globalParameters.filters.yearLimitHigh)) {
            globalParameters.filters.yearLimitLow = new_x0;
            globalParameters.filters.yearLimitHigh = new_x1;
            reDrawCircle(globalParameters);
            showGeneralInfo(globalParameters);
        }
    }


    /**
     * dblclicked - If selection is double clicked, cancels the selection and puts
     * the boundaries for years to the first and last year in the dataset.
     *
     * @return None
     */
    function dblclicked() {
        const selection = d3.brushSelection(this) ? null : x.range();
        [x0, x1] = d3.extent(data.map(function(d) {
            return new Date(+d.year, 0, 1);
        }));

        new_x0 = x0.getFullYear();
        new_x1 = x1.getFullYear();
        if ((new_x0 !== globalParameters.filters.yearLimitLow) | (new_x1 !== globalParameters.filters.yearLimitHigh)) {
            globalParameters.filters.yearLimitLow = new_x0;
            globalParameters.filters.yearLimitHigh = new_x1;
            reDrawCircle(globalParameters);
            showGeneralInfo(globalParameters);
        }
        d3.select(this).call(brush.move, selection);
    }

}
