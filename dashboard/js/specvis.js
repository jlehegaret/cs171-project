SpecVis = function(_parentElement, _data, _eventHandler, _options) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.options = _options || {width:700, height:700};
    this.displayData = [];
    this.allIssues = [];

    // defines constants
    this.margin = {top: 20, right: 20, bottom: 20, left: 50};
    this.width = this.options.width - this.margin.left - this.margin.right;
    this.height = this.options.height - this.margin.top - this.margin.bottom;

    this.initVis();
};

SpecVis.prototype.initVis = function() {
    var that = this;

    this.dateFormatter = d3.time.format("%Y-%m-%d");
    this.radius = Math.min(this.width, this.height) / 2;

    this.color = d3.scale.category20c();
    this.x = d3.scale.linear()
        .range([0, 2 * Math.PI]);
    this.y = d3.scale.sqrt()
        .range([0, this.radius]);

    // constructs SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (this.margin.left + this.margin.right + this.width)/2 + "," +(this.margin.top + this.margin.bottom + this.height)/2 + ")");

    //sets up the partition layout
    this.partition = d3.layout.partition()
        .size([2 * Math.PI, this.radius * this.radius])
        .value(function(d) { return 1; });

    //sets up the arc generator for the radial sunburst
    this.arc = d3.svg.arc()
        .startAngle(function(d) { return d.x; })
        .endAngle(function(d) { return d.x + d.dx; })
        .innerRadius(function(d) { return Math.sqrt(d.y); })
        .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });


    // filter, aggregate, modify data
    this.wrangleData();
    // call the update method
    this.updateVis();
};


//TODO: This is still under construction
SpecVis.prototype.wrangleData = function(_dateFilterFunction) {
    var that = this;

    //setup the default date filter function (right now filtering from march 1, 2015 to now)
    var dateFilterFunction = function(d){return new Date(d.created_at) >= new Date("2015-03-01") && new Date(d.created_at) <= new Date()};
    if (_dateFilterFunction != null){
        dateFilterFunction = _dateFilterFunction;
    }


    var totalIssues1 = 0;
    //create a lookup table of specs keyed by url
    this.displayData.spec_lookup = {};
    this.data.specs.forEach(function(d) {
        //new spec objects need to be created to not filter out items from allData
        spec = {};
        spec.url = d.url;
        spec.name = d.title;
        if(d.issues) {
            //console.log(d.issues.filter(dateFilterFunction));
            spec.issues = d.issues.filter(dateFilterFunction);
            totalIssues1 += spec.issues.length;
        }
        that.displayData.spec_lookup[d.url] = spec;
    });
    console.log(this.displayData.spec_lookup);
    console.log(totalIssues1);

    this.displayData.test_lookup = {};
    this.data.tests.forEach(function(test) {
        if(dateFilterFunction(test)) {
            test.specs.forEach(function (spec) {
                //check if an entry already exists, if not create one
                if (!that.displayData.test_lookup[spec]) {
                    that.displayData.test_lookup[spec] = [];
                }
                that.displayData.test_lookup[spec].push(test);
            })
        }
    });
//   console.log(this.displayData.test_lookup);

    this.displayData.root = {name:"W3C", children:[]};

    var totalIssues2 = 0;
    this.data.groups.forEach(function(d) {
        var group = {};
        group.name = d.name;
        group.shortname = d.shortname;
        group.url = d.url;
        group.children = [];
        d.specs.forEach(function(dd) {
            var spec = {};
            spec.url = dd.url;
            spec.children = [{name:"HTML", children:[]},{name:"Tests", children:[]}];
            if(that.displayData.spec_lookup[dd.url]) {
                spec.name = that.displayData.spec_lookup[dd.url].name;
                spec.children[0].children = that.displayData.spec_lookup[dd.url].issues;
                if(spec.children[0].children) {
                    totalIssues2 += spec.children[0].children.length
                }
            } else {
                console.log("Spec Not Found Error: " + dd.url);
            }
            if(that.displayData.test_lookup[dd.url]) {
                spec.children[1].children = that.displayData.test_lookup[dd.url];
            } else {
               //console.log("No Tests for: " + dd.url);
            }
            group.children.push(spec);
        });
        that.displayData.root.children.push(group);
    });
    console.log(totalIssues2);

    var totalIssues = 0;
    this.displayData.root.children.forEach(function(d) {
        d.children.forEach(function(dd) {
            dd.children.forEach(function(ddd) {
                if(ddd.children) {
                   // console.log(ddd.children);
                    totalIssues+=ddd.children.length;
                }
            });
        });
    });
    console.log(totalIssues);
    console.log(this.displayData.root);
};

SpecVis.prototype.updateVis = function() {
    var that = this;

    var click = function(d) {
        console.log(d);
    };

    // Setup for switching data: stash the old values for transition.
    var stash = function(d) {
        d.x0 = d.x;
        d.dx0 = d.dx;
    };

    // When switching data: interpolate the arcs in data space.
    var arcTweenData = function(a, i) {
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
            var xd = d3.interpolate(that.x.domain(), [node.x, node.x + node.dx]);
            return function(t) {
                that.x.domain(xd(t));
                return tween(t);
            };
        } else {
            return tween;
        }
    };

    this.partition(this.displayData.root);

    var path = this.svg.datum(this.displayData.root).selectAll("path")
        .data(this.partition.nodes);
    path
        .enter().append("path")
        .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
        .attr("d", this.arc)
        .style("stroke", "#fff")
        .style("fill", function(d) {return that.color((d.children ? d : d.parent).name); })
        .style("fill-rule", "evenodd")
        .on("click", click)
        .each(stash);

//    path.attrTween("d", arcTweenData);
//    path
//        .exit().remove();

    //var text = this.svg.selectAll("text").data(this.partition.nodes);
    //var textEnter = text.enter().append("text")
    //    .style("fill-opacity", 1)
    //    .style("fill", "black")
    //    .attr("text-anchor", function(d) {
    //        return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
    //    })
    //    .attr("dy", ".2em")
    //    .attr("transform", function(d) {
    //        var multiline = (d.name || "").split(" ").length > 1,
    //            angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
    //            rotate = angle + (multiline ? -.5 : 0);
    //        return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
    //    });
    //
    //textEnter.append("tspan")
    //    .attr("x", 0)
    //    .text(function(d) { return d.depth ? d.name.split(" ")[0] : ""; });
    //textEnter.append("tspan")
    //    .attr("x", 0)
    //    .attr("dy", "1em")
    //    .text(function(d) { return d.depth ? d.name.split(" ")[1] || "" : ""; });
};

SpecVis.prototype.onSelectionChange = function(selectionStart, selectionEnd) {
    console.log("select from " + selectionStart + " to " + selectionEnd);
    this.wrangleData(function(d) {return new Date(d.created_at) >= selectionStart && new Date(d.created_at) <=selectionEnd});
    this.updateVis();
};
