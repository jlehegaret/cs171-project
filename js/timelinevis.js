TimelineVis = function(_parentElement, _data, _eventHandler, _filters, _options) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.processedData = [];
    this.displayData = [];
    this.eventHandler = _eventHandler;
    this.options = _options || {
        width:1200, height:200
    };
    this.filters = _filters || {
        "start_date"  : "2015-01-01",
        "end_date"    : "2015-05-05",
        "category"  : ["spec", "test"],
        "actions"     : ["ISS_O", "PR_O", "PUB"],
        "specs"       : [],
        "who"         : []
    };
    // adapt filters object to the info it was given
    if(this.filters.state === "open") {
        this.filters.actions = ["ISS_O","PR_O", "PUB"];
    } else {
        this.filters.actions = ["ISS_O", "ISS_C",
                                "PR_O", "PR_C",
                                "COM", "PUB"];
    }
    if(this.filters.category == "all")
    {
        this.filters.category = ["spec", "test"];
    }

    // defines constants
    this.margin = {top: 20, right: 20, bottom: 20, left: 40};
    this.width = this.options.width - this.margin.left - this.margin.right;
    this.height = this.options.height - this.margin.top - this.margin.bottom;

    this.dateFormatter = d3.time.format("%Y-%m-%d");

    this.reorderData(); // creates .processedData by date but complete
    this.initVis();
};

TimelineVis.prototype.initVis = function() {
    var that = this;
    var space = this.height/2;

    // constructs SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("class", "timeline")
        .attr("transform", "translate(" + this.margin.left
              + "," + this.margin.top + ")");

    // focus is the zoomed selection
    this.focus = this.svg.append("g")
        .attr("class", "context");

    // context is the brushing window
    this.context = this.svg.append("g")
        .attr("class", "focus");

    // creates scales
    this.x0 = d3.time.scale.utc()
                    .range([0, this.width]);

    // place axes - although now it's just one :-)
    this.y_axisType = d3.scale.ordinal()
                      .domain([
                               "spec code",
                               "spec count",
                               "test code",
                               "test count"
                              ])
                      .range([
                              space,
                              space,
                              space,
                              space
                              ]);

// how high should each bar be?
    this.height_lines = d3.scale.pow()
        .exponent(.2)  // the lower this number, the higher the "small" bars become
        .range([0, space]);
    this.height_count = d3.scale.pow()
        .exponent(.5)  // on the other side, when this number is 1, it is a linear scale
        .range([0, space]);

    // create x axis  - saving y-axis for later if ever
    this.xAxis = d3.svg.axis()
        .scale(this.x0)
        .orient("bottom");

    // prepare for display bars
    this.context.append("g")
            .attr("class", "bars");

    // Add axes visual elements
    this.context.append("g")
        .attr("class", "x axis")  // put it in the middle
        .attr("transform", "translate(0," + this.height + ")");

    // draw the various x-axis lines
    this.context.append("g")
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
    this.tip = this.tooltip();

    // brushing
    this.brush = d3.svg.brush()
         .on("brush", function(){
             $(that.eventHandler).trigger("brushChanged",
             that.brush.extent());
        });
    this.context.append("g")
         .attr("class", "brush");


    // filter, aggregate, modify data
    this.wrangleData(); // will create displayData, which is filtered
    // call the update method
    this.updateVis();
};

TimelineVis.prototype.updateVis = function() {
    var that = this;

// console.log("in update vis");
// console.log(this.displayData);

    // update scales
    this.x0.domain(d3.extent(this.displayData.dates, function(d)
                    { return Date.parse(d.date); } ));

    // when grouping bars
    // update bar widths - right now we have 6 bars in each group
    this.bar_width = 2;
    this.bar_padding = 3;
    this.bar_place = this.bar_width + this.bar_padding;
    this.x1 = d3.scale.ordinal()
                      .domain([ "PUB", "COM",
                                "PR_C", "PR_O",
                                "ISS_C", "ISS_O",
                              ])
                      .range([  0,
                                this.bar_place,
                                (2 * this.bar_place),
                                (3 * this.bar_place),
                                (4 * this.bar_place),
                                (5 * this.bar_place)
                            ]);

    this.height_lines.domain([0, this.displayData.max_linesCode]);
    this.height_count.domain([0, this.displayData.max_numIssues]);

    // update axis
   this.context.select(".x.axis")
      .call(this.xAxis);

    // update graph:
    var dates = this.context.select(".bars")
                        .selectAll(".date")
                        .data(this.displayData.dates, function(d)
                          { return d.date; });

if(this.displayData.dates.length > 0)
{
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
    var bars = dates
        .call(this.tip)
        .selectAll("rect.timebar")
        .data(function(d) { return d.actions; })
        .enter()
        .append("rect")
        .attr("class", function(d) {
            var res = "timebar " + d.type;
            var detailsRec = d.details.filter(function(dd) {
                    return dd.status == "REC"; }
            );
            if(d.type === "PUB" && d.details.length === detailsRec.length ) {
                res = res + " REC";
            }
            return res;
        })
        .on("mouseover", this.tip.show)
        .on("click", this.tip.show);
     // .on("mouseout", this.tip.hide);

    // for all bars, new and changing
    bars.attr("width", function(d) {
        if(d.type === "PUB") {
            return 1;
        } else {
            return that.bar_width;
        }})
        .attr("height", function(d) {
            if(d.type === "PUB") {
                d.height = that.height;
            } else if(d.scale === "code") {
                d.height = that.height_lines(d.total);
                // NOTE:  If you want "fill in" the space more,
                //   use the exponent in the POW scale function instead
                //   see lines 70 - 75 ish
            } else {
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
                    if(d.type === "PUB")
                    {
                      d.y = 0;
                    }
                    else
                    {
                      if(d.dir === "up")
                      {
                        d.y = that.y_axisType(d.cat + " " + d.scale)
                              - d.height;
                      }
                      else  // it points down and so just starts at axis
                      {
                        d.y = that.y_axisType(d.cat + " " + d.scale);
                      }
                    }
                    return d.y;
                  });
}
// WILL NEED TO DO THIS WHEN START FILTERING
    // remove any not-needed-bars
    // d3.selectAll("rect.timebar").exit().remove();

    // remove any not-needed-dates
    dates.exit().remove();

    // update brush
    this.brush.x(this.x0);
    this.context.select(".brush")
         .call(this.brush)
         .selectAll("rect")
         .attr("height", this.height);

console.log("FINISHED updateVis");
};


TimelineVis.prototype.wrangleData = function() {
  // this is where we will apply filters and recalculate totals
  // and remove all bits that don't have any data in them anyway

  var that = this;
  var filtered;
  var value;
  var keep_going;
  var yes;
  var spec_match;

  // start new
  that.displayData =  {
                        max_linesCode : 0,
                        max_numIssues : 0,
                        dates: []
                      };

console.log("Reassembling with these filters");
console.log(that.filters);

  // we will check each day's complete data for data we want to display
  this.processedData.forEach(function(d) {

      var day = {};
      // if we're in the timeframe
      if( d.date >= that.filters.start_date
          && d.date <= that.filters.end_date )
      {
        day = { "date"    : d.date,
                "actions" : []
              };
        // evaluate data for this date
        d.actions.forEach(function(dd) {
          if (dd.total > 0)  // we have some data we might want to see
          {
            if(that.filters.category.indexOf(dd.cat) !== -1
               && that.filters.actions.indexOf(dd.type) !== -1)
            {
              //  We may want to see this item
              if( (that.filters.who === null
                      & that.filters.specs.length == 0)
                  || dd.type == "PUB")
              {
                  // we do not have any work to do
                  filtered = dd;
              } else {
                filtered= {};
                filtered.cat = dd.cat;
                filtered.dir = dd.dir;
                filtered.scale = dd.scale;
                filtered.type = dd.type;
                filtered.details = [];
                filtered.total = 0;
                dd.details.forEach(function(ddd)
                {
                  yes = false;
                  keep_going = false;

                  if(that.filters.specs.length = 0)
                  {
                    keep_going = true;
                  } else { // need to check spec first
                    if(ddd.url !== undefined)
                    {
                      if(that.filters.specs.indexOf(ddd.url) !== -1)
                      {
                        keep_going = true;
                      }
                    } else if (ddd.specs !== undefined)
                    {
                      spec_match = ddd.specs.filter(function(e)
                              { return that.filters.specs.indexOf(e) !== -1; });
                      if(spec_match.length > 0)
                      {
                        keep_going = true;
                      }
                    } else {
console.log("What is this ddd?");
console.log(ddd);
                    }
                  }
                  // check if we're interested in this spec
                  if(keep_going)
                  {
// console.log("Found relevant spec");
                    if(!that.filters.who) // it's just null
                    {
// console.log("Don't need to check who");
                      yes = true;
                    } else { // need to check who as well
console.log("Checking for " + that.filters.who);
                      // and it's complicated because we need to
                      //  be sure that our who of interest
                      //  did whatever action is THIS DAY'S action
                      if( ( dd.type === "PR_O"
                            || dd.type === "ISS_O")
                          && ddd.author.login === that.filters.who) {
                          yes = true;
                      } else {
console.log(dd.type);
console.log(ddd);
                      }

                    }
                  } // done checking
                  // if the above filter found the data worthy
                  if(yes)
                  { // add the data and update the total
                    filtered.details.push(ddd);
                    if(dd.scale === "code")
                    {
                      filtered.total += ddd.line_added
                                        + ddd.line_deleted;
                    } else {
                        if(ddd.difficulty !== undefined)
                        {
                          (ddd.difficulty === "easy") ? value = 1 : value = 2
                        } else { // not flagged, flag it this way
                          value = 3;
                        }
                        filtered.total += value;
                    }
                  }
                });
              }
              if(filtered.total > 0)
              {
                day.actions.push(filtered);
                // check if either maximum needs to be updated
                if(dd.scale === "code")
                {
                  if (filtered.total > that.displayData.max_linesCode)
                  {
                      that.displayData.max_linesCode = dd.total;
                      // that.displayData.max_codedate = d.date;
                  }
                } else
                {
                  if (filtered.total > that.displayData.max_numIssues)
                  {
                    that.displayData.max_numIssues = dd.total;
                    // that.displayData.max_issdate = d.date;
                  }
                }
                // console.log("day.actions is now");
                // console.log(day.actions);
              }
            }
          }
        });
      }
  // IF we found data meeting the criteria, add it to displayData
      if(day.actions && day.actions.length > 0) {
        that.displayData.dates.push(day);
      }
  });

  if(that.displayData.dates !== undefined && that.displayData.dates.length > 0)
  {
    that.displayData.dates.sort(function(a,b) { return a.date < b.date; });
  }
  // console.log("displayData is now: ");
  // console.log(this.displayData);
};

TimelineVis.prototype.reorderData = function() {
    var that = this;

    // CREATE processedData by CALLING
    // the main data-wrangling function on each
    //   set of data we have
    this.processedData = [];
    this.data.specs.forEach(function(d) {
        that.processData(d, "spec");
    });
    // console.log(this.data.tests);
    this.data.tests.forEach(function(d) {
        that.processData(d, "test");
    });
};


// MAIN DATA WRANGLING FUNCTION
// for each "thing" in the data
// check the array for an element with that date
// create the element if necessary,
//  initializing it with blanks for each data type
// based on type,
//  add/subtract the number of lines to display_lines
//  add details to the details_array
TimelineVis.prototype.processData = function(d, category) {
    var that = this;
    var today;
    var index;
    // need to change element number depending
    // on category being processed
    var plus = category === "spec" ? 0 : 6;

    if(d.last_pub !== undefined) {
        today = that.processedData[that.findDate(d.last_pub)].actions[0 + plus];
        today.total++;
        today.details.push(d);
    }

    // COMMITS
    if(d.commits !== undefined) {
        d.commits.forEach(function(c) {
            c.url = d.url; // copy spec url in there
            today = that.processedData[that.findDate(c.date)].actions[1 + plus];
            today.total += (c.line_added + c.line_deleted);
            today.details.push(c);
        });
    }

    if( (category === "spec" && d.issues !== undefined) || category == "test")
    {
        var process = d.issues ? d.issues : [d];

        process.forEach(function(c) {
            // copy spec url in there
            if(d.specs !== undefined && c.specs === undefined) {
              c.specs = d.specs;
            } else {
              c.url = d.url;
            }
            // is it a PR or an issue
            if(c.type === "pull" || c.type === "test") {
                // when was it created
                today = that.processedData[that.findDate(c.created_at)].actions[2 + plus];
                today.total += (c.line_added + c.line_deleted);
                today.details.push(c);
                // when was it possibly closed
                if(c.closed_at !== undefined) {
                    today = that.processedData[that.findDate(c.closed_at)].actions[3 + plus];
                    today.total += (c.line_added + c.line_deleted);
                    today.details.push(c);
                }
            }
            else if(c.type === "issue") {
                // when was it created
                today = that.processedData[that.findDate(c.created_at)].actions[4 + plus];

                // how hard is it
                var value;
                if(c.difficulty !== undefined) {
                    (c.difficulty === "easy") ? value = 1 : value = 2
                }
                // not flagged, flag it this way
                else {
                    value = 3;
                }
                today.total += value;
                c.difficulty_value = value;
                today.details.push(c);
                // when was it possibly closed
                if(c.closed_at !== undefined) {
                    today = that.processedData[that.findDate(c.closed_at)].actions[5 + plus];
                    today.total += value;
                    today.details.push(c);
                }
            }
            else { console.log("What is this?"); console.log(c); }
        });
    } // end of d.issues work
};

//Looks for the array index of a date in the processedData array
//If it's not found create a new day object at the end of the array
TimelineVis.prototype.findDate = function (day) {
    var that = this;
    var found = false;

    for (var i = 0; i < that.processedData.length; i++) {
        if (that.processedData[i].date === day) {
            return i;
        }
    }

    // if we're here, we need to create a new element
    that.processedData.push({
        "date": day,
        "actions": [{
            "cat": "spec",
            "type": "PUB",
            "total": 0,
            "details": []
        }, {
            "cat": "spec",
            "type": "COM",
            "scale": "code",
            "dir": "up",
            "total": 0,
            "details": []
        }, {
            "cat": "spec",
            "type": "PR_O",
            "scale": "code",
            "dir": "up",
            "total": 0,
            "details": []
        }, {
            "cat": "spec",
            "type": "PR_C",
            "scale": "code",
            "dir": "up",
            "total": 0,
            "details": []
        }, {
            "cat": "spec",
            "type": "ISS_O",
            "scale": "count",
            "dir": "up",
            "total": 0,
            "details": []
        }, {
            "cat": "spec",
            "type": "ISS_C",
            "scale": "count",
            "dir": "up",
            "total": 0,
            "details": []
        }, {
            "cat": "test",
            "type": "PUB",
            "total": 0,
            "details": []
        }, {
            "cat": "test",
            "type": "COM",
            "scale": "code",
            "dir": "down",
            "total": 0,
            "details": []
        }, {
            "cat": "test",
            "type": "PR_O",
            "scale": "code",
            "dir": "down",
            "total": 0,
            "details": []
        }, {
            "cat": "test",
            "type": "PR_C",
            "scale": "code",
            "dir": "down",
            "total": 0,
            "details": []
        }, {
            "cat": "test",
            "type": "ISS_O",
            "scale": "count",
            "dir": "down",
            "total": 0,
            "details": []
        }, {
            "cat": "test",
            "type": "ISS_C",
            "scale": "count",
            "dir": "down",
            "total": 0,
            "details": []
        }]
    });

    // returns the location of the newly created last element at the end of the array
    return (that.processedData.length - 1);
};

TimelineVis.prototype.tooltip = function() {
    return d3.tip()
        .offset([0,0])
        .html(function(d)
        {

            // text = "<p class='d3-tip'>"
            //         + d.cat + " " + d.type + "<br>"
            //         + "total: " + d.total + " height: " + d.height + "<br>"
            //         + "y " + d.y
            //         + "</p>";

            var text = "<ul class='d3-tip'>";
            d.details.forEach(function(dd)
            {
                text = text + "<li>";

                // define how to access this dd
                if(d.type === "PUB")
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
};

// EVENT HANDLERS


TimelineVis.prototype.onSelectionChange = function(sunburstSelection) {
    if(sunburstSelection.type === "root")
    {
        this.filters.specs = [];
    }
    else if(sunburstSelection.type === "group")
    {
        this.filters.specs = sunburstSelection.children
                            .map(function(d) { return d.url; });
    }
    else if (sunburstSelection.type === "spec")
    {
        this.filters.specs = [sunburstSelection.url];
    }
    else if (sunburstSelection.type === "HTML"
                || sunburstSelection.type === "Tests")
    {
        this.filters.specs = [sunburstSelection.parent.url];
    }
    else // we are (probably) dealing with the outer layer
    {
        if(sunburstSelection.children === undefined)
        {
            this.filters.specs = [sunburstSelection.parent.parent.url]
        } else {
            console.log("How should WhoVis interpret Sunburst's");
            console.log(sunburstSelection);
        }
    }
    // and a "just in case"
    if(this.filters.specs === undefined) { this.filters.specs = []; }

    this.wrangleData();
    this.updateVis();
};

TimelineVis.prototype.onAuthorChange = function(author) {
    this.filters.who = author;
    this.wrangleData();
    this.updateVis();
};