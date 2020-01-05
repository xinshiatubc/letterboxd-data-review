const csvUrl = 'diary.csv';

var Catagories = {
	Streaming: ["netflix","amazon prime","youtube","mubi", "kanopy","criterion channel","itunes",
			"vimeo","Le Cinéma Club","crave","instagram"],
	Ticket: ["cineplex","viff","cinematheque","rio"],
	Venue:["scotiabank","fifth ave","international village","vancity","cinematheque","moa",
		   "rio","park royal","park","marine drive","cdm","orpheum","new beverly cinema","playhouse","centre"],
	Format:["3d","35mm","live score","70mm"],
	Series:["iff19","bhm","24hrmm2019","viff19","doxa19","vaff","rapture",
			"Film Studies","vimff","cinema salon"],
	Others:["52filmsbywomen2019","commentary"]
}
let taglist = {};
let yearCount = {};
let dailyCount = {};
getData()
	.then(function(){
		//createTagContainer(taglist);
		createPieChartContainer(taglist);
		createBarChartContainer(yearCount);
		createHeatMapContainer(dailyCount);
	});

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function csvToArray(text) {
    let p = '', row = [''], ret = [row], i = 0, r = 0, s = !0, l;
    for (l of text) {
        if ('"' === l) {
            if (s && l === p) row[i] += l;
            s = !s;
        } else if (',' === l && s) l = row[++i] = '';
        else if ('\n' === l && s) {
            if ('\r' === p) row[i] = row[i].slice(0, -1);
            row = ret[++r] = [l = '']; i = 0;
        } else row[i] += l;
        p = l;
    }
    return ret;
};



function createHeatMapContainer(dailyCount){
	var dateData =[];
	for(date in dailyCount){
		if(date.startsWith('2019')){
			var day = {};
			day.date = date;
			day.dow = moment(date).day();
			day.detail = dailyCount[date];
			day.count = dailyCount[date].length;
			dateData.push(day);
		}

	}

    const dateValues = dateData.map(function(dv){
      	var oDay = new Date(dv.date);
      	var offsetDate = oDay.setDate(oDay.getDate() + 1);
      	return{
      		date: d3.timeDay(offsetDate),
        	value: Number(dv.count),
        	detail:dv.detail
        }
     
    });  

    const svg = d3.select("#svg");


    const height = 250;
	const width = 1000;
	const margin = { left: 50, top: 10, right: 50, bottom: 10 };

	const getRatio = side => (margin[side] / width) * 100 + '%';

	const marginRatio = {
	  left: getRatio('left'),
	  top: getRatio('top'),
	  right: getRatio('right'),
	  bottom: getRatio('bottom')
	};

	const container = d3.select('#svg')
	  	.style('padding',
	    		marginRatio.top + ' ' + marginRatio.right + ' ' +
	    		marginRatio.bottom + ' ' + marginRatio.left + ' ')
	  	.attr('preserveAspectRatio', 'xMinYMin meet')
	  	.attr('viewBox','0 0 ' +
	      (width + margin.left + margin.right) +
	      ' ' +
	      (height + margin.top + margin.bottom)
	  	);	

	const cellSize = width / 52;
    const yearHeight = cellSize * 7;

    const years = d3
          .nest()
          .key(d => d.date.getUTCFullYear())
          .entries(dateValues)
          .reverse();

    const values = dateValues.map(c => c.value);
    const maxValue = d3.max(values);
    const minValue = d3.min(values);

   	const group = svg.append("g");

    const year = group
          .selectAll("g")
          .data(years)
          .join("g")
          .attr(
            "transform",
            (d, i) => `translate(50, ${yearHeight * i + cellSize * 1.5})`
          );

    const formatDay = d =>
          ["S", "M", "T", "W", "T", "F", "S"][d.getUTCDay()];
    const countDay = d => d.getUTCDay();
    const timeWeek = d3.utcSunday;

    //map color
    const colorFn = d3
          .scaleSequential(d3.interpolatePuBu)
          .domain([Math.floor(minValue-1), Math.ceil(maxValue-3)]);

        
    year  .append("g")
          .attr("text-anchor", "end")
          .selectAll("text")
          .data(d3.range(7).map(i => new Date(1995, 0, i)))
          .join("text")
          .attr("x", -5)
          .attr("y", d => (countDay(d) + 0.5) * cellSize)
          .attr("dy", "0.31em")
          .attr("font-size", 12)
          .text(formatDay);

	var tooltip = d3.select('div#heatmap-container')
				    .append("div")
				    .style("opacity", 0)
				    .attr("class", "d3-tip");

	var mouseover = function(d) {
					    tooltip
					      .style("opacity", 1)
					    d3.select(this)
					      .style("opacity", 1)
					      .style("stroke", "black")
					      
  					};
  	var mousemove = function(d) {
  						var parseDate = d3.timeFormat("%B %d %A");
  						var date = parseDate(d.date);
  						var text = d.value > 1 ? "films":"film";
					  	var html_tooltip = "<strong>" + date + "</strong> <br /><br />" 
						  						+ d.value + " "+ text +"<br />";
						  	for(var i = 0; i< d.detail.length; i++){
						  		html_tooltip += "<li>" + d.detail[i] + "</li>";
						  	}
						var	leftPos = ( (window.innerWidth - d3.event.pageX) < 200 ) ?
										d3.event.pageX - 10 * cellSize : d3.event.pageX + cellSize;
					    tooltip
					      .html(html_tooltip)
					      .style("left", (leftPos) + "px")
					      .style("top", (d3.event.pageY - cellSize) + "px")
  					}
  	var mouseleave = function(d) {
					    tooltip
					      .style("opacity", 0)
					    d3.select(this)
					      .style("stroke", "none")
  					}

	year.append("g")
        .selectAll("rect")
        .data(dateValues)
        .join("rect")
        .attr("width", cellSize - 1.5)
        .attr("height", cellSize - 1.5)
        .attr("rx", 3).attr("ry", 3) // rounded corners
        .attr("x",
            d => timeWeek.count(d3.utcYear(d.date), d.date) * cellSize + 10)
        .attr("y", d => countDay(d.date) * cellSize + 0.5)
        .attr("fill", d => colorFn(d.value)) 
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave);

	const legend = group.append('g')
   						.attr('transform', `translate(${cellSize * 51 + 1.5 }, ${years.length * yearHeight + cellSize * 3})`)


	const categories = [1,2,3,4,8]

	
	legend .selectAll('rect')
		   .data(categories)
		   .enter()
		   .append('rect')
		   .attr('fill', d => colorFn(d))
		   .attr('x', (d, i) => cellSize * i )
		   .attr('width', cellSize-1.5)
		   .attr('height', cellSize-1.5)
		   .attr("rx", 3).attr("ry", 3)

    legend
          .selectAll("text")
          .data(categories)
          .join("text")
          .attr("transform", "")
          .attr("x", (d, i) =>  + (cellSize) * i)
          .attr("y", cellSize * 1.5)
          .attr("text-anchor", "start")
          .attr("font-size", 11)
          .text(d => (d < 5? d :'>5'));
	 }





function createPieChartContainer(taglist){


	function pieChart (dataSet) {
	  	
	  	var color = d3
          .scaleSequential(d3.interpolateGnBu)
          .domain([0, 71]);

		var pie = d3.pie()
	     		.value(d => d.count)
	     		.sortValues(function(a, b) { return a-b; })
	     		.padAngle(.005);    

		var animationDuration = 750,
		    data = [],
		    innerRadius = 0,
		    outerRadius = 100,
		    arc = d3.arc();

		function updateTween (d) {
		    var i = d3.interpolate(this._current, d);
		    this._current = i(0);
		    return function(t) {
		      return arc(i(t));
		    };
		  }

	  function exitTween (d) {
	    var end = Object.assign({}, this._current, { startAngle: this._current.endAngle });
	    var i = d3.interpolate(d, end);
	    return function(t) {
	      return arc(i(t));
	    };
	  }

	  function joinKey (d) {
	    return d.data.count;
	  }

	  function pieChart (context) {



	  	var donutTip = d3.select("#pie-container")
					.append("div")
					.style("opacity", 0)
    				.attr("class", "d3-tip");

	   	var mouseover = function(d) {
						    donutTip
						      .style("opacity", 1)
						    d3.select(this)
						      .style("opacity", 1)
						      .style("stroke","black");
	  					};
	  	
	    var mousemove = function (d, i) {
	  						var html_tooltip = "<strong>" + d.data.name + "</strong> <br /><br />" 
							  						+ d.data.count +"<br />";

	        				d3  .select(this)
	        					.style("opacity", 1);

	        				donutTip.html(html_tooltip)
						      		.style("opacity", 1)
	            					.style("left", (d3.event.pageX + 10) + "px")
	            					.style("top", (d3.event.pageY - 15) + "px");
	    				}

	  	var mouseleave = function (d, i) {
	        d3.select(this).style("stroke", "none");     
	        donutTip.style("opacity", 0);

	    }

	    var slices = context.selectAll('.slice').data(pie(data),joinKey);

	    var oldSlices = slices.exit();

	    var newSlices = slices.enter().append('path')
	      .each(function(d) { this._current = Object.assign({}, d, { startAngle: d.endAngle }); })
	      .attr('class', 'slice')
	      .attr('fill', d => color(d.data.count))
	      .on("mouseover", mouseover)
		  .on("mousemove", mousemove)
		  .on("mouseleave", mouseleave);

	    var t = d3.transition().duration(animationDuration);

	    arc.innerRadius(innerRadius).outerRadius(outerRadius);

	    oldSlices
	      .transition(t)
	        .attrTween('d', exitTween)
	        .remove();

	    var t2 = t.transition();
	    slices
	      .transition(t2)
	        .attrTween('d', updateTween);

	    var t3 = t2.transition();
	    newSlices
	      .transition(t3)
	        .attrTween('d', updateTween);
	  }

	  pieChart.data = function (_) {
	    return arguments.length ? (data = _, pieChart) : data;
	  };

	  pieChart.innerRadius = function (_) {
	    return arguments.length ? (innerRadius = _, pieChart) : innerRadius;
	  };

	  pieChart.outerRadius = function (_) {
	    return arguments.length ? (outerRadius = _, pieChart) : outerRadius;
	  };

	  return pieChart;
	}


	
	let streamingData = [], theatricalData = [];
	let streamingCount = 0, theatricalCount = 0;

	for(tag in taglist){
		if(Catagories.Streaming.includes(tag) ){
			var platformItem = {};
			platformItem.name = tag;
			platformItem.count = taglist[tag].length;
			platformItem.detail = taglist[tag];
			streamingData.push(platformItem);
			streamingCount += platformItem.count;

		}
		if(Catagories.Venue.includes(tag)){
			var theatricalItem = {};
			theatricalItem.name = tag;
			theatricalItem.count = taglist[tag].length;
			theatricalItem.detail = taglist[tag];
			theatricalData.push(theatricalItem);
			theatricalCount += theatricalItem.count;

		}
	}

	const width = 300;
	const height = 300;
	const radius =  width/2 - 10;
	const donutWidth = 75;

	var pieChart = pieChart().outerRadius(radius).innerRadius(donutWidth);

	var svg = d3.select('#pie-container')
     			.append('svg')
      			.attr("width", "30%")
         		.attr("height", "30%")
         		.attr('viewBox', (-width / 2) + ' ' + (-height / 2) + ' ' + width + ' ' + height)
         		.attr('preserveAspectRatio', 'xMinYMin')
         		.append('g');

	var domPieChart = svg.attr('class', 'pie-chart')
	  					 .call(pieChart.data(streamingData));

	d3.select("button#theatrical")
	  .on("click", function () {
	        domPieChart.call(pieChart.data(theatricalData));
	    });
	d3.select("button#streaming")
	  .on("click", function () {
	       domPieChart.call(pieChart.data(streamingData));
	    });

}

function createBarChartContainer(yearCount){

	var data =[];

	for(year in yearCount){
		var yearItem ={};
		yearItem.year = year;
		yearItem.frequency = yearCount[year].length;
		yearItem.detail = yearCount[year];
		data.push(yearItem);
	}

	recentData = data.splice(-2,2);

	const height = 200;
	const width = 700;
	const barWidth = width / data.length;
	const margin = { left: 50, top: 10, right: 50, bottom: 10 };

	const getRatio = side => (margin[side] / width) * 100 + '%';

	const marginRatio = {
	  left: getRatio('left'),
	  top: getRatio('top'),
	  right: getRatio('right'),
	  bottom: getRatio('bottom')
	};

	var x = d3.scaleBand()
	.rangeRound([0, width])
	.padding(0.1);

	var y = d3.scaleLinear()
		.rangeRound([height, 0]);



	var tooltip = d3.select('div#chart-container')
				    .append("div")
				    .style("opacity", 0)
				    .attr("class", "d3-tip");

    var mouseover = function(d) {
					    tooltip
					      .style("opacity", 1)
					    d3.select(this)
					      .style("opacity", 1)
  					};
  	var mousemove = function(d) {
  						var text = (d.frequency > 1) ? " films":" film";
					  	var html_tooltip = "<strong>" + d.year + " : </strong> <span>" 
						  						+ d.frequency + text +"</span><br />";
						if(d.detail.length < 20){
						  	for(var i = 0; i< d.detail.length; i++){
						  		html_tooltip += "<li>" + d.detail[i] + "</li>";
						  	}	
						 }
						var	leftPos = ( (window.innerWidth - d3.event.pageX) < 200 ) ?
							d3.event.pageX - 23 * barWidth : d3.event.pageX + barWidth;  	
					    tooltip
					      .html(html_tooltip)
					      .style("left", (leftPos) + "px")
					      .style("top", (d3.event.pageY - 15) + "px")
  					}
  	var mouseleave = function(d) {
					    tooltip.style("opacity", 0)
					    d3.select(this)
					      .style("stroke", "none")
  					}

	const svg = d3.select('div#chart-container').append('svg')
	  	.style('padding',
	    		marginRatio.top + ' ' + marginRatio.right + ' ' +
	    		marginRatio.bottom + ' ' + marginRatio.left + ' ')
	  	.attr('preserveAspectRatio', 'xMinYMin meet')
	  	.attr('viewBox','0 0 ' +
	      (width + margin.left + margin.right) +
	      ' ' +
	      (height + margin.top + margin.bottom)
	  	);


	x.domain(data.map(function(d) { return d.year; }));
	y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

	svg.selectAll(".bar")
	    .data(data)
	  .enter().append("rect")
	    .attr("class", "bar")
	    .attr("x", function(d) { return x(d.year); })
	    .attr("width", x.bandwidth())
	    .attr("y", function(d) { return y(d.frequency); })
	    .attr("height", function(d) { return height - y(d.frequency); })
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave);

	//createPieContainer(recentData);
}

function createTagContainer(taglist){
	  var tagListContainer = document.createElement('div');
      tagListContainer.className = 'tagList';
      document.body.appendChild(tagListContainer);

      var filmContainer = document.createElement('div');
      filmContainer.className = 'tagFilm';
      document.body.appendChild(filmContainer);

      for( var catagory in Catagories){
      	var catagoryContainer = document.createElement('div'); 
      	var catagoryText = document.createTextNode(catagory);
      	catagoryContainer.appendChild(catagoryText);
      	catagoryContainer.className = catagory;
      	tagListContainer.appendChild(catagoryContainer);
      	var hr = document.createElement('hr'); 
      	tagListContainer.appendChild(hr);

      }
	//var tagListContainer = document.getElementsByClassName("tagList");
	//var filmContainer = document.getElementsByClassName("tagFilm");
/*
	function showFilm(array){
		var filmList = document.createElement('ul');
		array.forEach( film =>{
			console.log(film);
			var listItem = document.createElement('li');
			listItem.value = film;
		});
		filmContainer.appendChild(filmList);
	}
*/
    for( var tag in taglist){

    	var button = document.createElement('button');
    	button.className = "btn";
    	var tagText = document.createTextNode(tag);
    	button.appendChild(tagText);
    	
    	for( var catagory in Catagories){
    		if(Catagories[catagory].includes(tag)){
    			var catagoryContainer = document.getElementsByClassName(catagory)[0];
    			catagoryContainer.appendChild(button);
    		}
      	}



    	//button.setAttribute('onclick',showFilm(taglist[tag]));
		
		//console.log(taglist[tag]);
	}	
}

async function getData(){
	const response = await fetch(csvUrl);
	const dataSet = await response.text();
	const data = csvToArray(dataSet).slice(1);

	data.forEach(row => {
		if(row != ''){
			const film = row[1];
			const year = row[2];
			const tags = row[6].replace(/,\s*/g, ",").split(',');
			const date = row[7];
			if(date in dailyCount){
				dailyCount[date].push(film);
			}
			else{
				dailyCount[date]=[film];
			}
			if(date.startsWith(2019)){
				if(year in yearCount){
					yearCount[year].push(film);
				}
				else{
					yearCount[year]=[film];
				}
				tags.forEach(tag => {
					if(tag in taglist){
						taglist[tag].push(film);
					}
					else{
						if(tag != '')
							taglist[tag]=[film];
					}
				});
			}
		}
	});
	//console.log(dailyCount);

	//createTagContainer(taglist);
	//console.log(taglist.filter(onlyUnique));
	/*
	for( var tag in taglist){
		console.log(tag);
		console.log(taglist[tag]);
	}	
	*/
}

