TimelineVis = function(_parentElement, _data, _eventHandler, _options) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.vizData = [];
    this.vizDates = [];
    this.eventHandler = _eventHandler;
    this.options = _options || {width:800, height:300};

    // defines constants
    this.margin = {top: 20, right: 20, bottom: 20, left: 50};
    this.width = this.options.width - this.margin.left - this.margin.right;
    this.height = this.options.height - this.margin.top - this.margin.bottom;

    this.dateFormatter = d3.time.format("%Y-%m-%d");

    this.reorderData();
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
                      .domain(["PR_O", "PR_C",
                              "ISS_O", "ISS_C",
                              "COM", "PUB"])
                      .rangeRoundBands([0, this.x0.range()]);

    this.color = d3.scale.ordinal()
                         .domain(["PR_O", "PR_C",
                                  "ISS_O", "ISS_C",
                                  "COM", "PUB"])
                          .range(["yellow", "yellow",
                                  "red", "red",
                                  "blue", "gray"]);

    this.y_linesCode = d3.scale.linear()
        .range([this.height, 0]);
        // domain is based on data

    this.y_issues = d3.scale.linear()
        .range([this.height, 0])
        .domain([1, 2, 3]);  // easy, not-easy, unknown

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
    this.wrangleData(null);
    // call the update method
    this.updateVis();
};

TimelineVis.prototype.updateVis = function() {
    var that = this;

    // update scales
    this.x0.domain(d3.extent(this.displayData, function(d)
                    { return d.date; } ));

    var biggest_value;
    biggest_value = d3.max(this.displayData.map(function(d)
                        {
                          return d3.max([d.Commits.total,
                                          d.PRs_created.total,
                                          d.PRs_closed.total]);
                        }));

    this.y_linesCode.domain([-biggest_value, biggest_value]);

    // update graph:
    var dates = this.svg.selectAll(".date")
                        .data(this.vizData, function(d)
                          { return d.date; });

    // create necessary containers for new dates
    dates.enter()
          .append("g")
          .attr("class", "group")

    // move the new date containers as needed

    // create necessary containers for new dates
    dates.enter()
        .append("rect")
        .attr("class", "bars")
        .fill(function(d) { return color(d.type) });
        // add more later for details in tooltip on click, etc.
        //  don't think I need the following here
        // .x0(0)
        // .x1(0)
        // .y(height/2)
        // .width(1)
        // .height(0)

    // change existing bars to match data
    bars.
.width
.height

    // remove any not-needed-bars


    // update axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    //update brush
    this.brush.x(this.x);
    this.svg.select(".brush")
        .call(this.brush)
        .selectAll("rect")
        .attr("height", this.height);
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

    if(d.commits)
    {
      d.commits.forEach(function(c)
      {
          index = findDate(c.date);
          today = that.displayData[index];
          today.actions[1].total++;
          today.actions[1].details.push(c);
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
          today.actions[2].total +=
            (c.line_added + c.line_deleted);
          today.actions[2].details.push(c);
          // when was it possibly closed
          if(c.closed_at)
          {
            index = findDate(c.closed_at);
            today = that.displayData[index];
            today.actions[3].total +=
              (c.line_added + c.line_deleted);
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

console.log("In Wrangle");
console.log(this.displayData);

  // eventually, we will drop certain records based on the
  //   filters provided
  // (we'll need to establish the nomenclature)

  // in the meantime, we'll show all
  // build a flat array, prime for showing graphically
  this.displayData.forEach(function(d)
  {
    var bar;

    // at some point, will try to make this more intelligent code
    if(d.Commits.details.length > 0)
    {
      bar = {};

      bar.date = d.date;
      bar.type = "COM";
      bar.total = d.Commits.details.length;
      bar.details = d.Commits.details;

      that.vizData.push(bar);
    }
    if(d.ISS_created.details.length > 0)
    {
      bar = {};

      bar.date = d.date;
      bar.type = "ISS_O";
      bar.total = 0;
      d.ISS_created.details.forEach(function (dd)
      {
        bar.total++;  // will make this more complicated
                      // when do test data
      });
      bar.details = d.ISS_created.details;

      that.vizData.push(bar);
    }
    if(d.ISS_closed.details.length > 0)
    {
      bar = {};

      bar.date = d.date;
      bar.type = "ISS_C";
      bar.total = 0;
      d.ISS_closed.details.forEach(function (dd)
      {
        bar.total++;  // will make this more complicated
                      // when do test data
      });
      bar.details = d.ISS_closed.details;

      that.vizData.push(bar);
    }
    if(d.PRs_created.details.length > 0)
    {
      bar = {};

      bar.date = d.date;
      bar.type = "PR_O";
      bar.total = 0;
      d.PRs_created.details.forEach(function (dd)
      {
        bar.total += (dd.line_added + dd.line_deleted);
      });
      bar.details = d.PRs_created.details;

      that.vizData.push(bar);
    }
    if(d.PRs_closed.details.length > 0)
    {
      bar = {};

      bar.date = d.date;
      bar.type = "PR_C";
      bar.total = 0;
      d.PRs_closed.details.forEach(function (dd)
      {
        bar.total += (dd.line_added + dd.line_deleted);
      });
      bar.details = d.PRs_closed.details;

      that.vizData.push(bar);
    }
    if(d.specs_pub.length > 0)
    {
      bar = {};

      bar.date = d.date;
      bar.type = "PUB";
      bar.total = d.specs_pub.length;
      bar.details = d.specs_pub;

      that.vizData.push(bar);
    }
  });

// remove later for performance sake
this.vizData.sort(function(a,b)
        {return Date.parse(a.date) - Date.parse(b.date); });

  console.log("vizData:");
  console.log(that.vizData);
}

