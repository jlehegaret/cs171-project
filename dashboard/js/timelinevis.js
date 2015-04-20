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
    var space = this.height/8; // REMOVE HARD-# IF FINAL LAYOUT

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

//  Right now, have pull requests next to commits
//    but perhaps we can/should stack those eventually
    this.x1 = d3.scale.ordinal()
                      .domain(["ISS_O", "ISS_C",
                               "PR_O", "PR_C",
                              "COM", "PUB"])
                      .range([0, 0, 1, 1, 0, 0]);

    this.y_axisType = d3.scale.ordinal()
                      .domain([
                               "spec code",
                               "spec count",
                               "test code",
                               "test count"
                              ])
                      .range([
                              space,
                              3*space,
                              5*space,
                              7*space
                              ]);

// how high should each bar be?
    this.height_lines = d3.scale.pow()
        .exponent(.2)
        .range([0, space]);
    this.height_count = d3.scale.pow()
        .exponent(.5)
        .range([0, space]);

    // create x axis  - saving y-axis for later if ever
    this.xAxis = d3.svg.axis()
        .scale(this.x0)
        .orient("bottom");

    // prepare for display bars
    this.svg.append("g")
            .attr("class", "bars");

    // Add axes visual elements
    this.svg.append("g")
        .attr("class", "x axis")  // put it in the middle
        .attr("transform", "translate(0," + this.height + ")");

    // draw the various x-axis lines
    d3.select("g.timeline")
      .append("g")
      .attr("class", "categoryLines")
      .selectAll(".categoryLine")
      .data(this.y_axisType.range())
      .enter()
      .append("line")
      .attr("class", "categoryLine")
      .attr("x1", 0)
      .attr("y1", function(d) { return d; })
      .attr("x2", this.width)
      .attr("y2", function(d) { return d; });

    // define our tooltip function
    this.tip = d3.tip()
                  .offset([0,0])
                  .html(function(d)
                    {
                      var fields = [];
                      var text = "<ul class='d3-tip'>";
                      d.details.forEach(function(dd)
                      {
                        text = text + "<li>";

                        // define how to access this dd
                        if(d.type == "PUB")
                        {
                          text = text + "<a href='" + dd.url + "'>"
                                + dd.title + "</a><br>" +
                                dd.status;
                        }
                        else if(d.cat === "spec" && d.type === "COM")
                        {
                          text = text + "<a href='" + dd.html_url + "'>"
                                + dd.title + "</a>";
                        }
                        else
                        {
                          text = text + "<a href='" + dd.html_url + "'>"
                                + dd.title + "</a><br>"
                                + dd.state;
                        }

                        text = text + "</li>";
                      });
                      text = text + "</ul>";

                      return text;
                    });

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

// console.log("In updateVis #7");

    // update scales
    this.x0.domain(d3.extent(this.vizData.dates, function(d)
                    { return Date.parse(d.date); } ));

    this.height_lines.domain([0, this.vizData.max_linesCode]);
    this.height_count.domain([0, this.vizData.max_numIssues]);

    // update axis
   this.svg.select(".x.axis")
      .call(this.xAxis);

    // update graph:
    var dates = this.svg.select(".bars")
                        .selectAll(".date")
                        .data(this.vizData.dates, function(d)
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
    var bars
    = dates.call(this.tip)
          .selectAll("rect.timebar")
          .data(function(d) { return d.actions; })
          .enter()
          .append("rect")
          .attr("class", function(d)
                  {
                    var res = "timebar " + d.type;
                    if(d.type == "PUB" && d.details.length
                         == d.details.filter(function(dd)
                            { return dd.status == "REC"; }
                            ).length )
                    {
                            res = res + " REC";
                    }
                    return res;
                  }
                )
          .on("mouseover", this.tip.show)
          .on("click", this.tip.show);
          // .on("mouseout", this.tip.hide);

    // for all bars, new and changing
    bars.attr("width", 1)
        .attr("height", function(d)
                  {
                    if(d.type == "PUB")
                    {
                      d.height = that.height;
                    }
                    else if(d.scale == "code")
                    {
                      d.height = that.height_lines(d.total);
                    }
                    else
                    {
                      d.height =  that.height_count(d.total);
                    }
                    return d.height;
                  })
        .attr("x", function(d) {
                                  // return 0; // for stacked charts
                                  // for grouped bar
                                  return that.x1(d.type);
                                })
        .attr("y", function(d)
                  {
                    if(d.type == "PUB")
                    {
                      d.y = 0;
                    }
                    else
                    {
                      if(d.dir == "up")
                      {
                        d.y = that.y_axisType(d.cat + " " + d.scale)
                              - d.height;
                      }
                      else  // opened issues or PRs
                      {
                        d.y = that.y_axisType(d.cat + " " + d.scale);
                      }
                    }
                    return d.y;
                  });

// WILL NEED TO DO THIS WHEN START FILTERING
    // remove any not-needed-bars
    // d3.selectAll("rect.timebar").exit().remove();

    // remove any not-needed-dates
    dates.exit().remove();

    // update brush
    this.brush.x(this.x0);
    this.svg.select(".brush")
        .call(this.brush)
        .selectAll("rect")
        .attr("height", this.height);

// console.log("Finished updateVis");
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
        "actions"       : [ { "cat"   : "spec",
                              "type"  : "PUB",
                              "total" : 0,
                              "details" : [] },
                            { "cat"   : "spec",
                              "type"  : "COM",
                              "scale" : "code",
                              "dir"   : "up",
                              "total" : 0,
                              "details" : [] },
                            { "cat"  : "spec",
                              "type" : "PR_O",
                              "scale": "code",
                              "dir"   : "down",
                              "total" : 0,
                              "details" : [] },
                            { "cat"  : "spec",
                              "type" : "PR_C",
                              "scale": "code",
                              "dir"   : "up",
                              "total" : 0,
                              "details" : [] },
                            { "cat"  : "spec",
                              "type" : "ISS_O",
                              "scale": "count",
                              "dir"   : "down",
                              "total" : 0,
                              "details" : [] },
                            { "cat"  : "spec",
                              "type" : "ISS_C",
                              "scale": "count",
                              "dir"   : "up",
                              "total" : 0,
                              "details" : [] },
                            { "cat"   : "test",
                              "type"  : "PUB",
                              "total" : 0,
                              "details" : [] },
                            { "cat"   : "test",
                              "type"  : "COM",
                              "scale" : "code",
                              "dir"   : "up",
                              "total" : 0,
                              "details" : [] },
                            { "cat"  : "test",
                              "type" : "PR_O",
                              "scale": "code",
                              "dir"   : "down",
                              "total" : 0,
                              "details" : [] },
                            { "cat"  : "test",
                              "type" : "PR_C",
                              "scale": "code",
                              "dir"   : "up",
                              "total" : 0,
                              "details" : [] },
                            { "cat"  : "test",
                              "type" : "ISS_O",
                              "scale": "count",
                              "dir"   : "down",
                              "total" : 0,
                              "details" : [] },
                            { "cat"  : "test",
                              "type" : "ISS_C",
                              "scale": "count",
                              "dir"   : "up",
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
  function processData(d, category)
  {
    var today;
    var index;
    var plus;  // need to change element number depending
                // on category being processed
    (category === "spec")
    ? plus = 0
    : plus = 6;

    if(d.last_pub)
    {

      today = that.displayData[findDate(d.last_pub)].actions[0 + plus];
      today.total++;
      today.details.push(d);
    }

    if(d.commits)
    {
      d.commits.forEach(function(c)
      {
          today = that.displayData[findDate(c.date)].actions[1 + plus];
          today.total += (c.line_added + c.line_deleted);
          today.details.push(c);
      });
    }

    if( (category == "spec" && d.issues)
        || category == "test")
    {
      var process;

      (d.issues)
      ? process = d.issues
      : process = [d];
      process.forEach(function(c)
      {
        // is it a PR or an issue
        if(c.type === "pull" || c.type === "test")
        {
          // when was it created
          today = that.displayData[findDate(c.created_at)].actions[2 + plus];
          today.total += (c.line_added + c.line_deleted);
          today.details.push(c);
          // when was it possibly closed
          if(c.closed_at)
          {
            today = that.displayData[findDate(c.closed_at)].actions[3 + plus];
            today.total += (c.line_added + c.line_deleted);
            today.details.push(c);
          }
        }
        else if(c.type === "issue")
        {
          // when was it created
          today = that.displayData[findDate(c.created_at)].actions[4 + plus];

          // how hard is it
          var value;
          if(c.difficulty)
          {
            (c.difficulty === "easy")
            ? value = 1
            : value = 2
          }
          else // not flagged, flag it this way
          {
            value = 3;
          }
          today.total += value;
          c.difficulty_value = value;
          today.details.push(c);
          // when was it possibly closed
          if(c.closed_at)
          {
            today = that.displayData[findDate(c.closed_at)].actions[5 + plus];
            today.total += value;
            today.details.push(c);
          }
        }
        else { console.log("What is this?"); console.log(c); }
      });
    } // end of d.issues work
  }


  // CREATE DISPLAYDATA by CALLING
  // the main data-wrangling function on each
  //   set of data we have
  this.displayData = [];
  this.data.specs.forEach(function(d)
  {
    processData(d, "spec");
  });
// console.log(this.data.tests);
  this.data.tests.forEach(function(d)
  {
    processData(d, "test");
  });

// removed for performance sake
// this.displayData.sort(function(a,b)
        // {return Date.parse(a.date) - Date.parse(b.date); });
// console.log("displayData");
// console.log(displayData);
}

TimelineVis.prototype.onSelectionChange = function(specs) {

};

TimelineVis.prototype.wrangleData = function(filters)
{
  // this is where we will apply filters and recalculate totals
  // and remove all bits that don't have any data in them anyway
  //
  var that = this;
  that.vizData = { max_linesCode : 0,
                  // max_codedate : "",
                  // max_issdate : "",
                   max_numIssues : 0,
                   dates         : []
                 };

  // TEMPORARY, UNTIL WE COORDINATE
  filters = { "start_date"  : "2014-01-01",
              "end_date"    : "2015-05-05",
              "categories"  : ["spec", "test"],
              "actions"     : ["ISS_O", "ISS_C",
                               "PR_O", "PR_C",
                               "COM", "PUB"],
              "who"         : []
            }

  this.displayData.forEach(function(d)
  {
    var day = {};

    // if we're in the timeframe
    if( ((!filters.start_date) || (d.date >= filters.start_date))
        &&
        ((!filters.end_date) || (d.date <= filters.end_date)) )
    {
      day = { "date"    : d.date,
              "actions" : []
            };

      // evaluate data for this date
      d.actions.forEach(function(dd)
      {
        if (dd.total > 0)  // we have some data we might want to see
        {
          if(    filters.categories.indexOf(dd.cat) !== -1
              && filters.actions.indexOf(dd.type) !== -1)
// ADD WHO LATER
          {
// if added who, need to recalculate TOTAL
            day.actions.push(dd);
            // check if either maximum needs to be updated
            if(dd.scale == "code")
            {
              if (dd.total > that.vizData.max_linesCode)
              {
                that.vizData.max_linesCode = dd.total;
                // that.vizData.max_codedate = d.date;
              }
            }
            else
            {
              if (dd.total > that.vizData.max_numIssues)
              {
                that.vizData.max_numIssues = dd.total;
                // that.vizData.max_issdate = d.date;
              }
            }
          }
        }
      });
    }

    // IF we found data meeting the criteria, add it to vizData
    if(day.actions && day.actions.length > 0)
    {
      that.vizData.dates.push(day);
    }
  });
// console.log("vizData: ");
// console.log(this.vizData);
}

