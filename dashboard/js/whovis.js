WhoVis = function(_parentElement, _data, _eventHandler, _filters, _options) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.options = _options || {
        "width"       : 7670,
        "height"      : 500
    };

    this.filters = _filters || {
        "start_date"  : "2014-01-01",
        "end_date"    : "2015-05-05",
        "categories"  : ["spec", "test"],
        "actions"     : ["ISS_O", "ISS_C",
            "PR_O", "PR_C",
            "COM", "PUB"],
        "specs"       : [],
        "who"         : [],
        "number_who"  : 20,
        "who_sort"    : "code"
    };


    this.displayData = [];
    this.processedData = d3.map();

    // defines constants
    this.margin = {top: 0, right: 10, bottom: 20, left: 50};
    this.width = this.options.width - this.margin.left - this.margin.right;
    // height is going to be as high as it needs to be for all bars
    //  but here is a default
    this.height = this.options.height - this.margin.top - this.margin.bottom;
    this.barHeight = 3;
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
        .range([this.height/4, -60]);


    this.y_issues = d3.scale.linear()
        .range([this.height/4, -60]);


    this.x = d3.scale.ordinal();

    this.color = d3.scale.ordinal()
    .range(["#062B59", "#09458F", "#073874", "#09458F", "#0B52AA", "#0C5FC5"]);

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
    } else if (this.filters.who_sort === "code") {
        this.displayData.sort(codeSort);
    } else {
        console.log("No sorting specified for WhoVis");
    }

    // figure out height
    this.height = this.displayData.length * 2*(this.barHeight + this.barPadding);

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

    this.x.domain(this.displayData.map(function(d) {
        return d.who;
    }))
        .rangeRoundBands([0, this.height], .2, 0);

    // this.svg.select(".x.axis")
    //     .call(this.xAxis)
    //     .selectAll("text");

    var bar = this.svg
        .selectAll("g.bars")
        .selectAll("g.who")
        .data(this.displayData, function(d) {
            return d.who;
        });

    var bar_enter = bar.enter()
            .append("g")
            .attr("class", "who")
            .on("click",function(d) {
            if(!d.selected) {
                d.selected = true;
                $(that.eventHandler).trigger("authorChanged", d.who);
            } else { // If author has already been selected, reset selection
                d.selected = false;
                $(that.eventHandler).trigger("authorChanged", null);
            }
        });

    bar_enter.append("text");

    bar_enter.append("rect")
              .data(this.displayData.map(function(d)
                    { return { "who" : d.who,
                               "total" : d.total_code,
                               "type" : "code" };
                    }))
              .attr("class", "bar code");

    bar_enter.append("rect")
              .data(this.displayData.map(function(d)
                    { return { "who" : d.who,
                               "total" : d.total_issues,
                               "type" : "issues" };
                    }))
              .attr("class", "bar issues");

    // update all bars showing data
    bar.attr("transform", function(d)
    {
        return "translate("+that.x(d.who)+","+ 140 +")";
    });

    bar.selectAll("rect.bar")
        .attr("width", that.barHeight)
        .attr("y", function(d) {
            if (d.type === "code"){

                return that.y_code(d.total);
            }
            else{

                return that.y_issues(d.total);
            }
        })
        .attr("x", function(d)
        {
            if(d.type === "issues")
            {
                // move it down by bar_height
                return that.barHeight + that.barPadding;
            }
            return 0;
        })
        .style("fill", function(d)
        {
            if(d.type === "code")
            {
                return that.color(d.who)
            }
            else
            {
                return "crimson";
            }
        })
        .transition()
        .delay(function(d, i) { return i * 10; })
        .attr("height", function(d)
        {
            if(d.type === "code")
            {
                return that.height/60 - that.y_code(d.total);
            }
            else
            {
                return that.height/60 - that.y_issues(d.total);
            }
        });


    bar.selectAll("text")
        .text(function(d){return d.who})
        .style("font-size", "8px")
        .style("text-anchor", "end")
        .attr("dx", "-17em")
        .attr("dy", "0.7em")
        .style("font-family", "sans-serif")
        .attr("transform", function(d) {
            return "rotate(-90)"
        });

    bar.exit()
        .remove();

};

WhoVis.prototype.onTimelineChange = function(selectionStart, selectionEnd) {
    this.filters.start_date = selectionStart;
    this.filters.end_date = selectionEnd;
    this.wrangleData();
    this.updateVis();
};

WhoVis.prototype.onSelectionChange = function(sunburstSelection) {
    //TODO: This function is triggered by a selection of an arc on a sunburst, wrangle data needs to be called on this selection
    console.log("Filter by " + sunburstSelection.type + " " + sunburstSelection.name);
};


WhoVis.prototype.wrangleData = function(filters) {
    var that = this;

  // CALL HELPER FUNCTIONS
  // that.displayData = [];
    if(that.filters.categories.indexOf("spec") !== -1) {
        that.data.specs.forEach(function(d) {
            if(that.filters.specs.length == 0 || that.filters.specs.indexOf(d.url) != -1) {
                that.processData(d, "spec");
            }
        });
    }
    if(that.filters.categories.indexOf("test") !== -1) {
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

  // // take enough elements to cover exceptions list, just in case
  // this.displayData = this.displayData.slice(0,
  //                     (this.options.number_who + except.length));

  // filter out exceptions

    this.displayData = this.processedData.values();

    this.displayData = this.displayData.filter(function(d) {
        return that.exclusions.indexOf(d.who) === -1;
    });

  // // make sure it's the right length
  // this.displayData = this.displayData.slice(0,
  //                     (this.options.number_who));

};

WhoVis.prototype.processData = function processData(d, category) {
    var that = this;
    var who;
    var index;
    var plus = category === "spec" ? 0 : 5;  // need to change element number depending
    // on category being processed

    // COMMIT FUNCTIONALITY
    if (d.commits && that.filters.actions.indexOf("COM") !== -1) {
        d.commits.forEach(function (c) {
            who = that.findWho(c.author);
            who.total_code += (c.line_added + c.line_deleted);
            who.work[plus].total += (c.line_added + c.line_deleted);
            who.work[plus].details.push(c);
        });
    }

    if ((category == "spec" && d.issues) || category == "test") {
        var process = d.issues ? d.issues : [d];

         process.forEach(function (c) {
            // is it a PR or an issue
            if (c.type === "pull" || c.type === "test") {
                // First, check data
                if (c.line_added == undefined) {
                    if (c["line added"]) {
                        console.log("Have line added instead of line_added");
                        c.line_added = c["line added"];
                    }
                    else {
                        c.line_added = 0;
                    }

                }

                if (c.line_deleted == undefined) {
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
                    && c.created_at >= that.filters.start_date) {
                    // who created it
                    who = that.findWho(c.author.login);
                    who.total_code += (c.line_added + c.line_deleted);
                    who.work[1 + plus].total += (c.line_added + c.line_deleted);
                    who.work[1 + plus].details.push(c);
                }

                if (c.closed_at) {
                    //  OUR DATA IS NOT PERFECT.  IF A PR IS NOT MERGED
                    //    WE ACTUALLY DON'T KNOW WHO CLOSED IT
                    if (c.merged_by || c.closed_by) {
                        // who possibly closed it
                        if (that.filters.actions.indexOf("PR_C") !== -1
                            && c.closed_at <= that.filters.end_date) {
                            if (c.merged_by) {
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
            }
            else if (c.type === "issue")
            // CURRENTLY, ONLY HAVE OPENING DATA
            {
                // how hard is it
                var value;
                if (c.difficulty) {
                    (c.difficulty === "easy")
                        ? value = 1
                        : value = 2
                }
                else // not flagged, flag it this way
                {
                    value = 3;
                }

                if (that.filters.actions.indexOf("ISS_O") !== -1
                    && c.created_at >= that.filters.start_date) {
                    // when was it created
                    who = that.findWho(c.author.login);
                    who.total_issues += value;
                    who.work[3 + plus].total += value;
                    who.work[3 + plus].details.push(c);
                }
                // if(c.closed_at
                //    && c.??? <= that.options.end_date)
                // {
                // when was it possibly closed
                // if(that.options.actions.indexOf("ISS_C") !== -1)
                // {
                // NEED DATA FOR THIS TO CODE FOR IT
                // }
                // }
            }
            else {
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
