WhoVis = function(_parentElement, _data, _eventHandler, _filters, _options) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.options = _options || {
        "width"       : 7670,
        "height"      : 300
    };

    this.filters = _filters || {
        "start_date"  : "2015-01-01",
        "end_date"    : "2015-05-05",
        "category"  : ["spec", "test"],
        "actions"     : ["ISS_O","PR_O"],
        "specs"       : [],
        "who"         : null,
        "who_sort"    : "code"
    };

    // adapt WhoVis filters object to the info it was given
    if(this.filters.state === "open") {
        this.filters.actions = ["ISS_O","PR_O"];
    } else {
        this.filters.actions = ["ISS_O", "ISS_C",
                                "PR_O", "PR_C",
                                "COM", "PUB"];
    }
    if(this.filters.category === "all")
    {
        this.filters.category = ["spec", "test"];
    }

    // defines constants
    this.margin = {top: 20, right: 10, bottom: 20, left: 50};
    this.width = this.options.width - this.margin.left - this.margin.right;
    // height is going to be as high as it needs to be for all bars
    //  but here is a default
    this.height = this.options.height - this.margin.top - this.margin.bottom;
    this.y_for_axis = this.height/2; // we give bars half the space, names the other half

    this.barWidth = 3;
    this.barPadding = 2;

    this.initVis();
};

WhoVis.prototype.initVis = function() {
    var that = this;

    this.dateFormatter = d3.time.format("%Y-%m-%d");

    // we exclude some people from this display
    this.exclusions = [ "Robin Berjon", "rberjon", "plehegar","darobin",
        "unknown", undefined];

    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g");

    this.y_code = d3.scale.linear()
        .range([this.y_for_axis, 0]);
    this.y_issues = d3.scale.linear()
        .range([this.y_for_axis, 0]);


    this.x = d3.scale.ordinal();

    // FOR CODE
    this.color_code = d3.scale.ordinal()
    .range(["#062B59", "#09458F", "#073874", "#09458F", "#0B52AA", "#0C5FC5"]);

    // FOR ISSUES
    this.color_issues = d3.scale.ordinal()
    .range(["crimson", "red"]);

    // this.xAxis = d3.svg.axis()
    // .scale(this.x)
    // .ticks(5)
    // .orient("top");

    this.svg.append("g")
            .attr("class", "bars");

    // this.svg.append("g")
    //     .attr("class", "x axis")
    //     .attr("transform", "translate(0," + -10 + ")");

    // filter, aggregate, modify data
    this.wrangleData();
    // call the update method
    this.updateVis();
};


WhoVis.prototype.updateVis = function() {

    var that = this;
// console.log("UpdateVis display data is:");
// console.log(this.displayData);

    // if want more space between bars, change this.barPadding
    //   here, we display two bars per person, so we need the "2"
    this.width = this.displayData.length * 2 * (this.barWidth + this.barPadding);

    this.parentElement.select("svg");

    // for lines of code
    this.max = d3.max(this.displayData, function(d) {
        return d.total_code;
    });
    this.y_code.domain([0, this.max]);

    // for number of issues
    this.max = d3.max(this.displayData, function(d) {
        return d.total_issues;
    });
    this.y_issues.domain([0, this.max]);

    this.x.domain(this.displayData.map(function(d) { return d.who; }))
          .rangeRoundBands([0, this.width], .2, 0);

    // this.svg.select(".x.axis")
    //     .call(this.xAxis)
    //     .selectAll("text");

    var whos = this.svg.selectAll("g.bars")
                        .selectAll("g.who")
                        .data(this.displayData,
                            function(d) { return d.who; });

// console.log("Before enter, whos is");
// console.log(whos);

    whos.enter()
        .append("g")
        .attr("class", "who")
        .on("click",function(d) {
                if(!d.selected) {
                    d.selected = true;
                    $(that.eventHandler).trigger("authorChanged", d.who);
                    that.filters.who = d.who;
                } else { // If author has already been selected, reset selection
                    d.selected = false;
                    $(that.eventHandler).trigger("authorChanged", null);
                    that.filters.who = null;
                }
        })
        .call(function(who) // for every who we just added
        {
          if(!who) { console.log("Null enter who ?!?");
                      return; }

            who.append("text")  // every who has a name
              .text(function(d){return d.who})
              .style("font-size", "8px")
              .style("text-anchor", "end")
              .attr("dx", "-17em")
              .attr("dy", "0.7em")
              .style("font-family", "sans-serif")
              .attr("transform", "rotate(-90)");

            who.append("rect")  // a code bar
              .data(that.displayData.map(function(d)
                    { return { "who" : d.who,
                               "total" : d.total_code,
                               "type" : "code" };
                    }), function(d) { return d.who + "code"; })
              .attr("class", function(d){
                        if(that.filters.who !== null
                           && d.who !== d.filters.who) {
                            return "bar code unselected";
                        } else {
                            return "bar code";
                        }
                    })
              .attr("x", 0)
              .attr("width", that.barWidth);

            who.append("rect") // and an issues bar
              .data(that.displayData.map(function(d)
                    { return { "who" : d.who,
                               "total" : d.total_issues,
                               "type" : "issues" };
                    }), function(d) { return d.who + "issues"; })
              .attr("class", function(d) {
                        if(that.filters.who !== null
                            && d.who !== d.filters.who) {
                            return "bar issues unselected";
                        } else {
                            return "bar issues";
                        }
                    })
              .attr("width", that.barWidth)
              .attr("x", function(d)
                    {
                        if(d.type === "issues")
                        {
                            // move it along by bar_height
                            return that.barWidth + that.barPadding;
                        }
                        return 0;
                    }
                );
          }); // done with entering items

// console.log("Update data");

    // update data for all whos children with data
    whos.selectAll(".bar.code")
        .data(that.displayData.map(function(d)
                    { return { "who" : d.who,
                               "total" : d.total_code,
                               "type" : "code" };
                    }), function(d) { return d.who + "code"; });

    whos.selectAll(".bar.issues")
        .data(that.displayData.map(function(d)
                    { return { "who" : d.who,
                               "total" : d.total_issues,
                               "type" : "issues" };
                    }), function(d) { return d.who + "issues"; });

// console.log("Now onto transitions");
    // make updates
    whos.transition()
        .attr("transform", function(d)
            {
                return "translate("+ that.x(d.who)+","+ 0 +")";
            })
        .call(function(who)
        {
// console.log(who);
          who.selectAll("rect.bar")
              .attr("y", function(d)
              {
                if (d.type === "code") {
                    return that.y_code(d.total);
                } else {
                    return that.y_issues(d.total);
                }
              })
              .attr("height", function(d)
              {
                  if(d.type === "code")
                  {
                      return that.y_for_axis - that.y_code(d.total);
                  }
                  else
                  {
                      return that.y_for_axis - that.y_issues(d.total);
                  }
              })
              .style("fill", function(d)
              {
                  if(d.type === "code") {
                      return that.color_code(d.who);
                  } else {
                      return that.color_issues(d.who);
                  }
              });
          });

    whos.exit().remove();

};



WhoVis.prototype.wrangleData = function() {
    var that = this;

// console.log("WrangleData filter options");
// console.log(this.filters);

    // reset possible old data
    this.displayData = [];
    this.processedData = d3.map();
        // (Can you explain this to me someday, John? - JLH)

  // CALL HELPER FUNCTIONS
    if(that.filters.category.indexOf("spec") !== -1) {
        that.data.specs.forEach(function(d) {
            if(that.filters.specs.length == 0
               || that.filters.specs.indexOf(d.url) != -1) {
                that.processData(d, "spec");
            }
        });
    }
    if(that.filters.category.indexOf("test") !== -1) {
        that.data.tests.forEach(function(d) {
            if(that.filters.specs.length == 0) {
                that.processData(d, "test");
            }
            // we need to check that a spec we care about is concerned
            else {
                var found = false;
                var i = 0;
                while(!found && i < that.filters.specs.length) {
                    if(that.filters.specs.indexOf(d.specs[i]) !== -1) {
                        found = true;
                    } else {
                        i++; // keep looking
                    }
                } if(found) { that.processData(d, "test"); }
            }
        });
    }

    this.displayData = this.processedData.values();

    // now sort according to preference
    var codeSort = function(a, b) {
        if(b.total_code < a.total_code) {
            return -1;
        } else if(b.total_code > a.total_code) {
            return 1;
        } else {
            return b.total_issues - a.total_issues;
        }
    };

    var issueSort = function(a, b) {
        if(b.total_issues < a.total_issues) {
            return -1;
        } else if(b.total_issues > a.total_issues) {
            return 1;
        } else {
            return b.total_code - a.total_code;
        }
    };


    if(this.filters.who_sort === "issue") {
        this.displayData.sort(issueSort);
    } else {
        this.displayData.sort(codeSort);
    }

  // filter out exceptions
  // // take enough elements to cover exceptions list, just in case
  // this.displayData = this.displayData.slice(0,
  //                     (this.options.number_who + except.length));
    this.displayData = this.displayData.filter(function(d) {
        return that.exclusions.indexOf(d.who) === -1;
    });
  // // make sure it's the right length
  // this.displayData = this.displayData.slice(0,10);

// console.log("WrangleData: display data is now:");
// console.log(this.displayData);
};

WhoVis.prototype.processData = function processData(d, category) {
    var that = this;
    var who;
    var index;
    // need to change element number depending
    // on category being processed
    var plus = category === "spec" ? 0 : 5;

// console.log("data:");
// console.log(d);

    // COMMIT FUNCTIONALITY
    if (d.commits && that.filters.actions.indexOf("COM") !== -1) {
        d.commits.forEach(function (c) {
            // check that it's a date we care about
            if(c.date >= that.filters.start_date
               && c.date <= that.filters.end_date)
            {
                who = that.findWho(c.author);
                who.total_code += (c.line_added + c.line_deleted);
                who.work[plus].total += (c.line_added + c.line_deleted);
                who.work[plus].details.push(c);
            }
        });
    }

    if ((category == "spec" && d.issues) || category == "test")
    {
        var process = d.issues ? d.issues : [d];
        process.forEach(function (c) {
            // is it a PR or an issue
            if (c.type === "pull" || c.type === "test") {
                // First, check data
                if (c.line_added === undefined) {
                    if (c["line added"]) {
                        console.log("Have line added instead of line_added");
                        c.line_added = c["line added"];
                    }
                    else {
                        c.line_added = 0;
                    }

                }

                if (c.line_deleted === undefined) {
                    if (c["line deleted"]) {
                        console.log("Have line deleted instead of line_deleted");
                        c.line_deleted = c["line deleted"];
                    }
                    else {
                        c.line_deleted = 0;
                    }

                }

                // Now, see if we want to see the data
                if (that.filters.actions.indexOf("PR_O") !== -1
                    && c.created_at >= that.filters.start_date
                    && c.created_at <= that.filters.end_date)
                {
                    // who created it
                    who = that.findWho(c.author.login);
                    who.total_code += (c.line_added + c.line_deleted);
                    who.work[1 + plus].total += (c.line_added + c.line_deleted);
                    who.work[1 + plus].details.push(c);
                } else
                {
                    // console.log(that.filters.actions.indexOf("PR_O"));
                    // console.log(c.created_at);
                    // console.log(that.filters.start_date);
                    // console.log(that.filters.end_date);
                }
                if (c.closed_at !== undefined) {
                    //  OUR DATA IS NOT PERFECT.  IF A PR IS NOT MERGED
                    //    WE ACTUALLY DON'T KNOW WHO CLOSED IT
                    if (c.merged_by !== undefined || c.closed_by !== undefined) {
                        // who possibly closed it
                        if (that.filters.actions.indexOf("PR_C") !== -1
                            && c.closed_at >= that.filters.start_date
                            && c.closed_at <= that.filters.end_date) {
                            if (c.merged_by !== undefined) {
                                who = that.findWho(c.merged_by.login);
                            }
                            else {
                                who = that.findWho(c.closed_by.login);
                            }
                            who.total_code += (c.line_added + c.line_deleted);
                            who.work[2 + plus].total += (c.line_added + c.line_deleted);
                            who.work[1 + plus].details.push(c);
                        }
                    }
                    else {
                        console.log("Need closed_by name");
                        console.log(c);
                    }
                }
            } else if (c.type === "issue") {
                // CURRENTLY, ONLY HAVE OPENING DATA
                // how hard is it
                var value;
                if (c.difficulty !== undefined) {
                    (c.difficulty === "easy")
                        ? value = 1
                        : value = 2
                } else { // not flagged, flag it this way
                    value = 3;
                }

                if (that.filters.actions.indexOf("ISS_O") !== -1
                    && c.created_at >= that.filters.start_date
                    && c.created_at <= that.filters.end_date) {
                    // when was it created
                    who = that.findWho(c.author.login);
                    who.total_issues += value;
                    who.work[3 + plus].total += value;
                    who.work[3 + plus].details.push(c);
                }

                if(c.closed_at !== undefined) {
                    if(that.filters.actions.indexOf("ISS_C") !== -1
                    && c.closed_at >= that.filters.start_date
                    && c.closed_at <= that.filters.end_date)
                    // when was it created
console.log("Looking for " + c.closed_by);
                    who = that.findWho(c.closed_by);
// if(!who) { console.log("Not found."); console.log(c); }
                    who.total_issues += value;
                    who.work[3 + plus].total += value;
                    who.work[3 + plus].details.push(c);
                }
            } else {
                console.log("What is this?");
                console.log(c);
            }
        });
    } // end of d.issues work

};

//TODO:method comments
WhoVis.prototype.findWho = function findWho(name) {
    var that = this;

    if(!this.processedData.has(name)){
        this.processedData.set(name, this.createWho(name));
    }

// console.log("Seeking" + name);
// console.log(this.processedData.get(name));

    return this.processedData.get(name);

};

WhoVis.prototype.createWho = function (name) {
    return {
        "who": name,
        "total_code": 0,
        "total_issues": 0,
        "work": [
            {
                "cat": "spec",
                "type": "COM",
                "scale": "code",
                "details": [],
                "total": 0
            },
            {
                "cat": "spec",
                "type": "PR_O",
                "scale": "code",
                "details": [],
                "total": 0
            },
            {
                "cat": "spec",
                "type": "PR_C",
                "scale": "code",
                "details": [],
                "total": 0
            },
            {
                "cat": "spec",
                "type": "ISS_O",
                "scale": "count",
                "details": [],
                "total": 0
            },
            {
                "cat": "spec",
                "type": "ISS_C",
                "scale": "count",
                "details": [],
                "total": 0
            },
            {
                "cat": "test",
                "type": "COM",
                "scale": "code",
                "details": [],
                "total": 0
            },
            {
                "cat": "test",
                "type": "PR_O",
                "scale": "code",
                "details": [],
                "total": 0
            },
            {
                "cat": "test",
                "type": "PR_C",
                "scale": "code",
                "details": [],
                "total": 0
            },
            {
                "cat": "test",
                "type": "ISS_O",
                "scale": "count",
                "details": [],
                "total": 0
            },
            {
                "cat": "test",
                "type": "ISS_C",
                "scale": "count",
                "details": [],
                "total": 0
            }]
    };
};

// EVENT HANDLERS

WhoVis.prototype.onTimelineChange = function(selectionStart, selectionEnd) {
    this.filters.start_date = selectionStart;
    this.filters.end_date = selectionEnd;
    this.wrangleData();
    this.updateVis();
};

// This is the sunburst
WhoVis.prototype.onSelectionChange = function(sunburstSelection) {
    //TODO: This function is triggered by a selection of an arc on a sunburst, wrangle data needs to be called on this selection
// console.log("SUNBURST says...");
// console.log(sunburstSelection);
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

WhoVis.prototype.onUISelectionChange = function(choices) {
    //TODO: This function is triggered by a selection of an arc on a sunburst, wrangle data needs to be called on this selection
    // console.log(choices);
    if(choices.status === "open") {
        this.filters.actions = ["ISS_O","PR_O"];
    } else {
        this.filters.actions = ["ISS_O", "ISS_C",
                                "PR_O", "PR_C",
                                "COM", "PUB"];
    }
    if(choices.category === "all") {
        this.filters.category = ["spec", "test"];
    } else {
        this.filters.category = [choices.category];
    }

    if(choices.who_sort === "issues") {
        this.filters.who_sort = "issues";
    } else {
        this.filters.who_sort = "code";
    }

    // console.log("After UI choice:");
    // console.log(this.filters);
    this.wrangleData();
    this.updateVis();
};
