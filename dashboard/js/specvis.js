SpecVis = function (_parentElement, _data, _eventHandler, _filters, _options) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    //NOTE: these options are overridden if _options is not null
    this.options = _options || {
        width: 750, height: 750
    };
    //NOTE: these filters are overridden if _filters is not null
    this.filters = _filters || {
        start_date: "2014-01-01",
        end_date: "2015-05-05",
        state: "open"
    };

    this.displayData = {};

    // defines constants
    this.margin = {top: 20, right: 20, bottom: 20, left: 50};
    this.width = this.options.width - this.margin.left - this.margin.right;
    this.height = this.options.height - this.margin.top - this.margin.bottom;

    this.transitionDuration = 500;

    this.initVis();
};

SpecVis.prototype.initVis = function () {
    var that = this;

    this.dateFormatter = d3.time.format("%Y-%m-%d");
    this.radius = Math.min(this.width, this.height) / 2;

    // sets up a default date filter (returns from a given date till now)
    this.currentDateFilter = this.dateFilter(new Date(this.filters.start_date), new Date(this.filters.end_date));
    // sets up default author filter (returns all)
    this.currentAuthorFilter = this.authorFilter(null);
    // sets up default state filter
    this.currentStateFilter = this.stateFilter(this.filters.state);


    //use standard descending ordering for all elements
    //except group issues and pulls separately
    var sortTypes = function(a,b) {
            if(a.type < b.type) {
                return -1;
            } else if(a.type > b.type) {
                return 1;
            } else if(a.state < b.state) {
                return -1;
            } else if(a.state > b.state) {
                return 1;
            } else if(a.name < b.name) {
                return -1;
            } else if(a.name > b.name) {
                return 1;
            } else {
                return d3.descending(a, b);
            }
    };

    this.x = d3.scale.linear()
        .range([0, 2 * Math.PI]);
    this.y = d3.scale.sqrt()
        .range([0, this.radius]);

    // constructs SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .classed("sunburst", true)
        .attr("transform", "translate(" + (this.margin.left + this.margin.right + this.width) / 2 + ","
        + (this.margin.top + this.margin.bottom + this.height) / 2 + ")");

    //sets up the partition layout
    this.partition = d3.layout.partition()
//        .size([2 * Math.PI, this.radius * this.radius])
        .value(function (d) {
            return 1;
        })
        .sort(sortTypes);

    //sets up the arc generator for the radial sunburst
    this.arc = d3.svg.arc()
        .startAngle(function (d) {
            return Math.max(0, Math.min(2 * Math.PI, that.x(d.x)));
        })
        .endAngle(function (d) {
            return Math.max(0, Math.min(2 * Math.PI, that.x(d.x + d.dx)));
        })
        .innerRadius(function (d) {
            return Math.max(0, that.y(d.y));
        })
        .outerRadius(function (d) {
            return Math.max(0, that.y(d.y + d.dy));
        });

    // set up tooltips
    this.tip = this.tooltip();

    // filter, aggregate, modify data
    this.wrangleData();
    // call the update method
    this.updateVis();
};


SpecVis.prototype.wrangleData = function (filters) {
    var that = this;

    var filterChain = this.createFilterChain(filters);

    //create a lookup table of specs keyed by spec url
    this.displayData.spec_lookup = {};
    this.data.specs.forEach(function (d) {
        //new spec objects need to be created to not filter out items from allData
        spec = {};
        spec.url = d.url;
        spec.name = d.title;
        spec.score = d.score;  // this is here now, but I don't see it showing up elsewhere
        if (d.issues) {
            spec.issues = d.issues.filter(filterChain);
        }
        if (d.commits) {
            spec.commits = d.commits.filter(filterChain);
        }
        that.displayData.spec_lookup[d.url] = spec;
    });

    //creates a lookup table of tests keyed by spec url
    this.displayData.test_lookup = {};
    this.data.tests.forEach(function (test) {
        if (filterChain(test)) {
            test.specs.forEach(function (spec) {
                //check if an entry already exists, if not create one
                if (!that.displayData.test_lookup[spec]) {
                    that.displayData.test_lookup[spec] = [];
                }
                that.displayData.test_lookup[spec].push(test);
            })
        }
    });


    // Create the root object for the vis data hierarchy
    var root = {name: "W3C", key: "root", type:"root", children: []};

    // Create a group object for every group in the original dataset
    // It is VERY important that every item has a unique key, or the layout will have undesirable behavior
    // This is especially true because certain specs belong to more than one group, requiring deep copies
    this.data.groups.forEach(function (_group) {
        var group = {};
        group.name = _group.name;
        group.shortname = _group.shortname;
        group.key = _group.shortname;
        group.type = "group";
        group.url = _group.url;
        group.children = [];
        //specs are only keyed by url in each group, spec_lookup will be used to find them in the original specs dataset
        _group.specs.forEach(function (_spec) {
            var spec = {};
            spec.url = _spec.url;
            spec.key = group.key + _spec.url;
            spec.type = "spec";
            if (that.displayData.spec_lookup[_spec.url]) {
                var _fullSpec = that.displayData.spec_lookup[_spec.url];

                //every spec will have two children, a group of issues for the HTML spec and a group of tests
                spec.children = [{  name: "HTML",
                                    type:"HTML",
                                    key: spec.key + "HTML",
                                    url: spec.url,
                                    children: []},
                                {   name: "Tests",
                                    type:"Tests",
                                    url: "", // WOULD BE NICE TO FILL THIS IN
                                    key: spec.key + "Tests",
                                    children: []}];

                spec.name = _fullSpec.name;
                if (_fullSpec.issues) {
                    _fullSpec.issues.forEach(function (_issue) {
                        var issue = {};
                        issue.title = _issue.title;
                        issue.key = spec.key + _issue.html_url;
                        issue.type = _issue.type;
                        issue.state = _issue.state;
                        issue.created_at = _issue.created_at;
                        issue.closed_at = _issue.closed_at;
                        issue.merged_at = _issue.merged_at;
                        issue.url = _issue.html_url;
                        spec.children[0].children.push(issue);
                    });
                }
                if (_fullSpec.commits) {
                    _fullSpec.commits.forEach(function (_issue) {
                        var commit = {};
                        commit.title = _issue.title;
                        commit.key = spec.key + _issue.html_url;
                        commit.type = "commit";
                        commit.state = "closed";
                        commit.created_at = _issue.date;
                        commit.closed_at = _issue.date;
                        commit.merged_at = _issue.date;
                        commit.url = _issue.html_url;
                        spec.children[0].children.push(commit);
                    });
                }
            }
            else {
                console.log("Error: Spec Not Found: " + _spec.url);
            }
            //looks for tests in the test lookup table, creates copies if found
            if (that.displayData.test_lookup[_spec.url]) {
                var _allTests = that.displayData.test_lookup[_spec.url];
                _allTests.forEach(function (_test) {
                    var test = {};
                    test.title = _test.title;
                    test.key = spec.key + _test.html_url;
                    if(_test.type === "test") {
                        test.type = "pull";
                    }
                    else {
                        test.type = _test.type;
                    }
                    test.html_url = _test.html_url;
                    test.state = _test.state;
                    test.created_at = _test.created_at;
                    spec.children[1].children.push(test);
                });
            } else {
                //console.log("Debug: No Tests for: " + dd.url);
            }
            group.children.push(spec);
        });
        root.children.push(group);
    });

    this.displayData.root = root;
};

//Updates visual elements with new data
SpecVis.prototype.updateVis = function () {

    var that = this;

    // click handler for each arc
    var click = function (d) {
        $(that.eventHandler).trigger("selectionChanged", d);
        path.transition()
            .duration(that.transitionDuration)
            .attrTween("d", that.arcTweenZoom(d));
    };

    var path = this.svg.selectAll("path")
        .data(this.partition.nodes(this.displayData.root), function (d) {
            return d.key;
        });

    var path_enter = path
        .enter()
        .append("path")
        .attr("class", function (d) {
            return d.type;
        })
        .classed("open", function(d) {
            return d.state === "open"
        })
        .classed("closed", function(d) {
            return d.state === "closed"
        })
        .style("opacity", function(d) {
             return that.caniuse(d);
         })
        .style("fill", this.sunburstFill)
        .on("click", click)
        .on("mouseover", this.tip.show);
    //       .each(this.stash);

    path
        .transition()
        .duration(that.transitionDuration)
        .attr("d", this.arc)
        .call(this.tip);
    //       .attrTween("d", this.arcTweenData);

    path
        .exit()
        .remove();
};

// Event handler to filter data by timeline selections
SpecVis.prototype.onTimelineChange = function (selectionStart, selectionEnd) {
    this.wrangleData(filters = {_dateFilterFunction: this.dateFilter(selectionStart, selectionEnd)});
    this.updateVis();
};

// Event handler to filter data by author selections
SpecVis.prototype.onAuthorChange = function(authorSelection) {
    this.wrangleData(filters = {_authorFilterFunction: this.authorFilter(authorSelection)});
    this.updateVis();
};

// Event handler to filter date by additional options.
// Expects _filters to be and object with at least a "state" field
SpecVis.prototype.onFilterChange = function(_filters) {
    filters = {
        _stateFilterFunction: this.stateFilter(_filters.state)
    };
    this.wrangleDate(filters);
    this.updateVis();
};


//Creates a filter chain closure function from an object containing filter functions
//Also keeps track of the current filter state for the visualization by updating this.currentFilter functions
SpecVis.prototype.createFilterChain = function (filters) {
    var dateFilterFunction = this.currentDateFilter;
    if (filters && filters._dateFilterFunction) {
        dateFilterFunction = filters._dateFilterFunction;
    }
    this.currentDateFilter = dateFilterFunction;

    var authorFilterFunction = this.currentAuthorFilter;
    if (filters && filters._authorFilterFunction) {
        authorFilterFunction = filters._authorFilterFunction;
    }
    this.currentAuthorFilter = authorFilterFunction;

    var stateFilterFunction = this.currentStateFilter;
    if (filters && filters._stateFilterFunction) {
        stateFilterFunction = filters._stateFilterFunction;
    }

    //returns closure that tests all the filter functions
    return filterChain = function(d) {
        return dateFilterFunction(d) && authorFilterFunction(d) && stateFilterFunction(d);
    };
};

// returns closure with filter for start to end date
// function checks date members for test, issue and commit objects
SpecVis.prototype.dateFilter = function(startDate, endDate) {

    startDate = new Date(startDate);
    endDate = new Date(endDate);

    return function(d) {
        //tests
        if (d.created_at !== undefined) {
            return new Date(d.created_at) >= startDate && new Date(d.created_at) <= endDate;
        }
        //spec?
        else if (d.created !== undefined) {
            return new Date(d.created) >= startDate && new Date(d.created) <= endDate;
        }
        //commits
        else if (d.date !== undefined) {
            return new Date(d.date) >= startDate && new Date(d.date) <= endDate;
        }
        //if there is no associated date, log and filter it out
        else {
            console.log("Error: Object missing date information:");
            console.log(d);
            return false;
        }
    }
};

// returns closure with filter for author
SpecVis.prototype.authorFilter = function(who) {
    // always returns true if no author is selected
    if(!who) {
        return function(d) {
            return true;
        }
    } else {
        // function has to check various fields to cover all objects that have author information
        return function (d) {
            // issues or commits
            if (d.author) {
                //issues and tests (has author object with members)
                if (d.author.login) {
                    //check merging author, otherwise just check overall author
                    if (d.merged_by) {
                        return d.merged_by.login || d.author.login === who;
                    } else {
                        return d.author.login === who;
                    }
                }
                //commits (has author field with name)
                else {
                    return d.login === who;
                }
            }
            // no author found
            else {
                console.log("Error: Object missing author information:");
                console.log(d);
                return false;
            }
        }
    }
};

//Takes a string of "all" "closed" and "open" and returns a closure
// to filter tests, issues and commits (commits are always closed)
SpecVis.prototype.stateFilter = function (state) {
    console.log(state);
    var open = function(d) {
        if(d.state) {
            return d.state === "open"
        } else {
            // commits have no state field and are always closed
            return false;
        }
    };
    var closed = function(d) {
        if(d.state) {
            return d.state === "closed"
        } else {
            //commits have no state field and are always closed
            return true;
        }
    };
    var all = function(d) {
        return true;
    };
    switch(state) {
        case "open":
            console.log("creating open state filter");
            return open;
        case "closed":
            console.log("creating closed state filter");
            return closed;
        default:
            console.log("created all state filter");
            return all;
    }
};

/// Utility methods

// Interpolate the scales!
SpecVis.prototype.arcTweenZoom = function (d) {
    var that = this;
    var xd = d3.interpolate(this.x.domain(), [d.x, d.x + d.dx]),
        yd = d3.interpolate(this.y.domain(), [d.y, 1]),
        yr = d3.interpolate(this.y.range(), [d.y ? 20 : 0, that.radius]);
    return function (d, i) {
        return i
            ? function (t) {
            return that.arc(d);
        }
            : function (t) {
            that.x.domain(xd(t));
            that.y.domain(yd(t)).range(yr(t));
            return that.arc(d);
        };
    };
};

// Setup for switching data: stash the old values for transition.
SpecVis.prototype.stash = function (d) {
    d.x0 = d.x;
    d.dx0 = d.dx;
};

// When switching data: interpolate the arcs in data space.
SpecVis.prototype.arcTweenData = function (a, i) {
    var oi = d3.interpolate({x: a.x0, dx: a.dx0}, a);

    function tween(t) {
        var b = oi(t);
        a.x0 = b.x;
        a.dx0 = b.dx;
        return arc(b);
    }

    if (i == 0) {
        // If we are on the first arc, adjust the x domain to match the root node
        // at the current zoom level. (We only need to do this once.)
        var xd = d3.interpolate(x.domain(), [node.x, node.x + node.dx]);
        return function (t) {
            x.domain(xd(t));
            return tween(t);
        };
    } else {
        return tween;
    }
};

//Utility method to count issues (all the leaves)
SpecVis.prototype.countIssues = function () {
    var totalIssues = 0;
    this.displayData.children.forEach(function (d) {
        d.children.forEach(function (dd) {
            dd.children.forEach(function (ddd) {
                if (ddd.children) {
                    totalIssues += ddd.children.length;
                }
            });
        });
    });
    return totalIssues();
};

//Can i use function
//TODO: always returns 1 as a placeholder for future function
SpecVis.prototype.caniuse = function (d) {
    if(d.type=="spec") {
        return 1;
    } else {
        return 1;
    }
};

//Sets up the tooltip function
SpecVis.prototype.tooltip = function() {
    return d3.tip()
        .offset([0, 0])
        .html(function (d) {
            var text;
            var link;

            if (d.name) {
                if (d.name == "HTML") {
                    text = "Spec";
                }
                else {
                    text = d.name;
                }
            } else {
                text = d.title;
            }
            if(d.type === "pull"
                || d.type === "commit"
                || d.type === "issue")
            {
                text = d.state + " " + d.type + ": " + text;
            }

            if(d.url !== undefined) {
                link = d.url;
            } else if(d.html_url !== undefined) {
                link = d.html_url;
            } else if(d.name !== "W3C") {
                console.log("Error: Object missing URL");
                console.log(d);
            }

            return "<div class='d3-tip'>"
                + "<a href='" + link
                + "'>" + text
                + "</a></div>";
        });
};

// Color filling method for sunburst
// Note most colors are in vis.css
SpecVis.prototype.sunburstFill = function(d,i) {
    var that = this;

    this.colorGroups = d3.scale.ordinal()
        .range(['#485F7A', '#2A3C4E', '#1E3248']);

    if (d.type === "group") {
        return that.colorGroups(i);
    }
    if (d.type === "spec") {
        //console.log(d.parent.name)
        //console.log(d)
        if (d.parent.name == "Web Applications Working Group") {
            return '#97A2B8';
        } else if (d.parent.name == "HTML Working Group") {
            return '#8F9299';
        } else if (d.parent.name == "Device APIs Working Group") {
            return '#6CAED7';
        } else if (d.parent.name == "Web Performance Working Group") {
            return '#C9B3A2';
        } else if (d.parent.name == "Web Real-Time Communications Working Group") {
            return '#888499';
        } else if (d.parent.name == "Web Application Security Working Group") {
            return '#6CAED7';
        } else {
            var colors = ['#97A2B8', '#B2BDC7'];
            var random_color = colors[Math.floor(Math.random() * colors.length)];
            return random_color;
        }
    }
};
