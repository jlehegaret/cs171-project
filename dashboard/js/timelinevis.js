TimelineVis = function(_parentElement, _data, _eventHandler, _options) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.options = _options || {width:800, height:300};
    this.displayData = [];
    this.allIssues = [];

    // defines constants
    this.margin = {top: 20, right: 20, bottom: 20, left: 50};
    this.width = this.options.width - this.margin.left - this.margin.right;
    this.height = this.options.height - this.margin.top - this.margin.bottom;

    this.dateFormatter = d3.time.format("%Y-%m-%d");

    this.initVis();
};

TimelineVis.prototype.initVis = function() {
    var that = this;

    // constructs SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // creates scales
    this.x0 = d3.time.scale.utc()
        .range([0, this.width]);
    this.x1 = d3.scale.ordinal()
                      .domain(["PR", "ISS", "COM"];
    this.color = d3.scale.ordinal()
                          .range(["yellow", "red", "blue"]);

    this.y_lines-code = d3.scale.linear()
        .range([this.height, 0]);
        // y=0 is in the middle of our graph, with +/- values

    this.y_issues = d3.scale.linear()
        .range([this.height, 0])
        .domain([1, 2, 3];  // easy, not-easy, unknown

    // create axes
    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom");
    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left");

    // prepare for display bars
    this.svg.append("g")
            .attr("class", "bars");

    // Add axes visual elements
    this.svg.append("g")
        .attr("class", "x axis")  // put it in the middle
        .attr("transform", "translate(0," + this.height/2 + ")");
    this.svg.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em");

    // brushing
    this.brush = d3.svg.brush()
        .on("brush", function(){
            $(that.eventHandler).trigger("brushChanged",
            that.brush.extent());
        });
    this.svg.append("g")
        .attr("class", "brush");


    // filter, aggregate, modify data
    this.wrangleData();
    // call the update method
    this.updateVis();
};


//TODO: This is still under construction
TimelineVis.prototype.wrangleData = function() {

  var that = this;

  var count = 0;
  var count2 = 0;

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
        "specs_pub"     : [],
        "PRs_created"   : { total: 0, details: [] },
        "PRs_closed"    : { total: 0, details: [] },
        "ISS_created"   : { total: 0, details: [] },
        "ISS_closed"    : { total: 0, details: [] },
        "Commits"       : { total: 0, details: [] }
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
      today.specs_pub.push(d);
    }

    if(d.commits)
    {
      d.commits.forEach(function(c)
      {
          index = findDate(c.date);
          today = that.displayData[index];
          today.Commits.total++;
          today.Commits.details.push(c);
      });
    }

    if(d.issues)
    {
      d.issues.forEach(function(c)
      {
        // is it a PR or an issue
        if(c.type === "pull")
        {
          // when was it created
          index = findDate(c.created_at);
          today = that.displayData[index];
          today.PRs_created.total +=
            (c.line_added + c.line_deleted);
          today.PRs_created.details.push(c);
          // when was it possibly closed
          if(c.closed_at)
          {
            index = findDate(c.closed_at);
            today = that.displayData[index];
            today.PRs_closed.total +=
              (c.line_added + c.line_deleted);
            today.PRs_closed.details.push(c);
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
          today.ISS_created.total++;
          today.ISS_created.details.push(c);
          // when was it possibly closed
          if(c.closed_at)
          {
            index = findDate(c.closed_at);
            today = that.displayData[index];


// REVISE THIS FOR DIFFICULTY WHEN ADD TESTS
            today.ISS_closed.total++;
            today.ISS_closed.details.push(c);
          }
        }
      });
    } // end of d.issues work
  });

this.displayData.sort(function(a,b)
        {return Date.parse(a.date) - Date.parse(b.date); });
console.log("Message #1: ");
console.log(this.displayData);
}

TimelineVis.prototype.updateVis = function() {
    var that = this;

    var dateRange = d3.extent(this.displayData, function(d) {
        return that.dateFormatter.parse(d.key);
    });


    // updates scale domain
    this.x.domain(dateRange);
//    this.x.nice(d3.time.week);
    this.y.domain(d3.extent(this.displayData,
            function(d) { return d.values.length; }));


    // updates graph


    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);
    this.svg.select(".y.axis")
        .call(this.yAxis);

    //updates brush
    this.brush.x(this.x);
    this.svg.select(".brush")
        .call(this.brush)
        .selectAll("rect")
        .attr("height", this.height);
};

TimelineVis.prototype.onSelectionChange = function(specs) {

};
