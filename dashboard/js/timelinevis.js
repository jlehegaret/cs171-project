TimelineVis = function(_parentElement, _data, _eventHandler, _options) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.vizData = [];
    this.eventHandler = _eventHandler;
    this.options = _options || {width:1200, height:300};

    // defines constants
    this.margin = {top: 20, right: 20, bottom: 20, left: 50};
    this.width = this.options.width - this.margin.left - this.margin.right;
    this.height = this.options.height - this.margin.top - this.margin.bottom;

    this.dateFormatter = d3.time.format("%Y-%m-%d");

    this.reorderData(); // creates .displayData by date but complete
    this.initVis();
};

TimelineVis.prototype.initVis = function() {

    var that = this;

    // constructs SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("class", "timeline")
        .attr("transform", "translate(" + this.margin.left
              + "," + this.margin.top + ")");

    // creates scales
    this.x0 = d3.time.scale.utc()
                    .range([0, this.width]);

    this.x1 = d3.scale.ordinal()
                      .domain(["ISS_O", "ISS_C",
                               "PR_O", "PR_C",
                              "COM", "PUB"])
                      .range([0, 0, 1, 1, 2, 3]);

    this.y_count = d3.scale.linear()
        .range([this.height/2, 0]);
        // need to divide height by 2 as need to go up and down
        // domain is based on data

    // also need to figure out how to scale for
    //  - lines of code
    //  - difficulty level of issues
    //  for now, just going with simple counts

    // create x axis  - saving y-axis for later if ever
    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom");

    // prepare for display bars
    this.svg.append("g")
            .attr("class", "bars");

    // Add axes visual elements
    this.svg.append("g")
        .attr("class", "x axis")  // put it in the middle
        .attr("transform", "translate(0," + this.height/2 + ")");

    // brushing
    this.brush = d3.svg.brush()
        .on("brush", function(){
            $(that.eventHandler).trigger("brushChanged",
            that.brush.extent());
        });
    this.svg.append("g")
        .attr("class", "brush");


    // filter, aggregate, modify data
    this.wrangleData(null); // will create filtered VizData
    // call the update method
    this.updateVis();
};

TimelineVis.prototype.updateVis = function() {
    var that = this;

console.log("In updateVis #2");

    // update scales
    this.x0.domain(d3.extent(this.vizData, function(d)
                    { return Date.parse(d.date); } ));

    var biggest_value;
    biggest_value = d3.max(this.vizData.map(function(d)
                      { return d3.max(d.actions,
                                function(dd)
                                  { return dd.total; }
                                );
                      }));

    this.y_count.domain([-biggest_value, biggest_value]);

    // update graph:
    var dates = this.svg.select(".bars")
                        .selectAll(".date")
                        .data(this.vizData, function(d)
                          { return d.date; });

    // create necessary containers for new dates
    dates.enter()
          .append("g")
          .attr("class", "date")
          .attr("transform", function(d)
                {
                  return "translate("
                          + that.x0(Date.parse(d.date))
                          + ",0)";
                });

    // create new bars within each date
    var bars = dates.selectAll("rect")
          .data(function(d) { return d.actions; })
          .enter()
          .append("rect")
          .attr("class", "timebar")
          .attr("class", function(d) { return d.type; });

    // for all bars, new and changing
    bars.attr("width", 1)
        .attr("height", function(d)
                  {
                    if(d.type == "PUB")
                    {
                      return that.height;
                    }
                    else
                    {
                      return that.y_count(d.total);
                    }
                  })
        .attr("x", function(d) { return that.x1(d.type); })
        .attr("y", function(d)
                  {
                    if(d.type == "PUB")
                    {
                      return 0;
                    }
                    else if(d.type == "COM"
                            || d.type == "PR_C"
                            || d.type == "ISS_C")
                    {
                      return that.height/2 - that.y_count(d.total);
                    }
                    else  // opened issues or PRs
                    {
                      return that.height - that.y_count(d.total);
                    }
                  });

    // remove any not-needed-bars


    // update axis
    // this.svg.select(".x.axis")
    //     .call(this.xAxis);

    //update brush
    // this.brush.x(this.x);
    // this.svg.select(".brush")
    //     .call(this.brush)
    //     .selectAll("rect")
    //     .attr("height", this.height);
console.log("Finished updateVis");
};



TimelineVis.prototype.onSelectionChange = function(specs) {

};

TimelineVis.prototype.reorderData = function() {

   var that = this;

  // helper functions

  var stripTime = function(dateTime) {
      return dateFormatter(new Date(dateTime))
  };

  function findDate(day)
  {
    var found = false;
    for(var i = 0; i < that.displayData.length; i++)
    {
      if(that.displayData[i].date == day)
      {
        return i;
      }
    }

    // if we're here, we need to create a new element
    that.displayData.push(
      { "date"          : day,
        "actions"       : [ { "type" : "PUB",
                              "total" : 0,
                              "details" : [] },
                            { "type" : "COM",
                              "total" : 0,
                              "details" : [] },
                            { "type" : "PR_O",
                              "total" : 0,
                              "details" : [] },
                            { "type" : "PR_C",
                              "total" : 0,
                              "details" : [] },
                            { "type" : "ISS_O",
                              "total" : 0,
                              "details" : [] },
                            { "type" : "ISS_C",
                              "total" : 0,
                              "details" : [] } ]

      });

    return (that.displayData.length - 1);
  }


  // MAIN DATA WRANGLING FUNCTION

  // for each "thing" in the data
  // check the array for an element with that date
  // create the element if necessary,
  //  initializing it with blanks for each data type
  // based on type,
  //  add/subtract the number of lines to display_lines
  //  add details to the details_array

  this.displayData = [];
  this.data.forEach(function(d)
  {
    var today;
    var index;
    if(d.last_pub)
    {
      index = findDate(d.last_pub);
      today = that.displayData[index];
      today.actions[0].total++;
      today.actions[0].details.push(d);
    }

    if(d.commits)  // WE DO NOT HAVE REAL #S FOR LINES OF CODE OF COMMITS
    {
      d.commits.forEach(function(c)
      {
          index = findDate(c.date);
          today = that.displayData[index];
          today.actions[1].total++;
          today.actions[1].details.push(c);
      });
    }

    if(d.issues)  // HERE WE ARE NOT YET USING # LINES OF CODE
    {
      d.issues.forEach(function(c)
      {
        // is it a PR or an issue
        if(c.type === "pull")
        {
          // when was it created
          index = findDate(c.created_at);
          today = that.displayData[index];
          today.actions[2].total++;
          today.actions[2].details.push(c);
          // when was it possibly closed
          if(c.closed_at)
          {
            index = findDate(c.closed_at);
            today = that.displayData[index];
            today.actions[3].total++;
            today.actions[3].details.push(c);
          }
        }
        else if(c.type === "issue")
        {
// if(c.difficulty)
// {
// console.log("found difficulty");
// console.log(today);
// }

          // when was it created
          index = findDate(c.created_at);
          today = that.displayData[index];

// REVISE THIS FOR DIFFICULTY WHEN ADD TESTS
          today.actions[4].total++;
          today.actions[4].details.push(c);
          // when was it possibly closed
          if(c.closed_at)
          {
            index = findDate(c.closed_at);
            today = that.displayData[index];


// REVISE THIS FOR DIFFICULTY WHEN ADD TESTS
            today.actions[5].total++;
            today.actions[5].details.push(c);
          }
        }
      });
    } // end of d.issues work
  });

// remove later for performance sake
this.displayData.sort(function(a,b)
        {return Date.parse(a.date) - Date.parse(b.date); });
console.log("displayData: ");
console.log(this.displayData);

}

TimelineVis.prototype.onSelectionChange = function(specs) {

};

TimelineVis.prototype.wrangleData = function(filters)
{
  var that = this;
  that.vizData = [];

  // this is where we will apply filters and recalculate totals

  // however, for now, we just use this.displayData
  this.vizData = this.displayData;

}

