
/*
	Run the action when we are sure the DOM has been loaded
	https://developer.mozilla.org/en-US/docs/Web/Events/DOMContentLoaded
	Example:
	whenDocumentLoaded(() => {
		console.log('loaded!');
		document.getElementById('some-element');
	});
*/
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
	// plot object is global, you can inspect it in the dev-console
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
	numCircles = 4,
	start = 0
	end =10
	centerWheelRadius = 60,
	songsPerCircle = 45,
	angleArcPerSong = Math.PI * 2 / songsPerCircle
	;

	const svg = d3.select("#wheel-container").append("svg")
	  .attr("width", (width + margin.left + margin.right))
	  .attr("height", (height + margin.top + margin.bottom))
		.style("float", "right")
		//.style("background-color", "pink")
		.append("g")
		.attr("transform", "translate(" +( width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")")
		;



	var outterRadius = d3.min([width, height]) / 2 ;




	d3.csv('small_colors_songs.csv')
	  .then(function(data) {

				var numberCircles = Math.ceil(data.length / songsPerCircle);
				var songsLastCircle = (data.length-1) % songsPerCircle + 1;
				var circleWidth = (outterRadius - centerWheelRadius) / numberCircles;
				var filledCircleWidth = 0.9 * circleWidth;
				var spaceBetweenCircles = circleWidth-filledCircleWidth;

				var idxOnAllCircles = songsLastCircle*numberCircles;
				var offsetAngle = songsLastCircle*angleArcPerSong;

				var arcGenerator = d3.arc();

				svg.append("circle")
					.attr("class", "center-wheel")
					.attr('cx',0 )
	        .attr('cy', 0 )
	        .attr('r',5)
					.style('fill', "transparent")
	        .style('stroke', 'black');

				var path = svg.selectAll("path")
					.data(data)
				 .enter().append("path")
				 .attr('class', 'song')
				 .attr("d", function(d, index) {
					 if (index < idxOnAllCircles){
						 var startAngle = angleArcPerSong*Math.floor(index/numberCircles);
						 var startRadius = centerWheelRadius + spaceBetweenCircles +
						 	circleWidth * (index%numberCircles);
					 } else {
						 var offset = index - idxOnAllCircles;
						 var startAngle = offsetAngle + angleArcPerSong*Math.floor(offset/(numberCircles-1));
						 var startRadius = centerWheelRadius + circleWidth +
						 	spaceBetweenCircles + circleWidth * (index%(numberCircles-1));
					 };
					 return arcGenerator({
							startAngle: startAngle,
							endAngle: startAngle + angleArcPerSong,
							innerRadius: startRadius,
							outerRadius: startRadius + filledCircleWidth
						});
				 })
				 .style("fill", function(d, i) {
					 return d.random_rgb;
				 })
				 .on('mouseover', function(d, i) {
				   d3.select(this).style('opacity', '0.5');
				 })
				 .on('mouseout', function(d) {
					 d3.select(this).style('opacity', '1.0');
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
