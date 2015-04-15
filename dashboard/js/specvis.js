SpecVis = function(_parentElement, _data, _eventHandler, _options) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.options = _options || {width:800, height:800};
    this.displayData = {};
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
//        .size([2 * Math.PI, this.radius * this.radius])
        .value(function(d) { return 1; });

    //sets up the arc generator for the radial sunburst
    this.arc = d3.svg.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, that.x(d.x))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, that.x(d.x + d.dx))); })
        .innerRadius(function(d) { return Math.max(0, that.y(d.y)); })
        .outerRadius(function(d) { return Math.max(0, that.y(d.y + d.dy)); });


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
    //create a lookup table of specs keyed by spec url
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
    //console.log(this.displayData.spec_lookup);
    //console.log(totalIssues1);

    //creates a lookup table of tests keyed by spec url
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
   //console.log(this.displayData.test_lookup);


    // Create the root object for the vis data hierarchy
    var root = {name:"W3C", children:[]};
    var totalIssues2 = 0;
    // Create a group object for every group in the original dataset
    this.data.groups.forEach(function(_group) {
        var group = {};
        group.name = _group.name;
        group.shortname = _group.shortname;
        group.url = _group.url;
        group.children = [];
        //specs are only keyed by url in each group, spec_lookup will be used to find them in the original specs dataset
        _group.specs.forEach(function(_spec) {
            var spec = {};
            spec.url = _spec.url;
            //every spec will have two children, a group of issues for the HTML spec and a group of tests
            spec.children = [{name:"HTML", children:[]},{name:"Tests", children:[]}];
            if(that.displayData.spec_lookup[_spec.url]) {
                spec.name = that.displayData.spec_lookup[_spec.url].name;
                spec.children[0].children = that.displayData.spec_lookup[_spec.url].issues;
                if(spec.children[0].children) {
                    totalIssues2 += spec.children[0].children.length
                }
            } else {
                console.log("Spec Not Found Error: " + _spec.url);
            }
            if(that.displayData.test_lookup[_spec.url]) {
                spec.children[1].children = that.displayData.test_lookup[_spec.url];
            } else {
               //console.log("No Tests for: " + dd.url);
            }
            group.children.push(spec);
        });
        root.children.push(group);
    });
    console.log(totalIssues2);

    var totalIssues3 = 0;
    root.children.forEach(function(d) {
        d.children.forEach(function(dd) {
            dd.children.forEach(function(ddd) {
                if(ddd.children) {
                   // console.log(ddd.children);
                    totalIssues3+=ddd.children.length;
                }
            });
        });
    });
    console.log(totalIssues3);

    this.displayData.root = root;
};

SpecVis.prototype.updateVis = function() {
    var that = this;

    //TODO: UGLY UGLY HACK: creates a deep copy of the root object, because the partition layout creates all sorts of funky
    //values on the live root object. Maybe there are issues with live object references?
    var rootJSONString = JSON.stringify(this.displayData.root);
    var root = JSON.parse(rootJSONString);



    // Setup for switching data: stash the old values for transition.
    var stash = function(d) {
        d.x0 = d.x;
        d.dx0 = d.dx;
    };


    var click = function(d) {
        console.log(d);
        path.transition()
            .duration(750)
            .attrTween("d", that.arcTween(d));
    };

    var path = this.svg.selectAll("path")
        .data(this.partition(root))
        .enter().append("path")
        .attr("d", this.arc)
        .style("fill", function(d) { return that.color((d.children ? d : d.parent).name); })
        .on("click", click);


    //var path = this.svg.selectAll("path")
    //    .data(this.partition.nodes(this.displayData.root))
    //    .enter().append("path")
    //    .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
    //    .each(stash);

//    path.attrTween("d", arcTweenData);

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

// Interpolate the scales!
SpecVis.prototype.arcTween = function(d) {
    var that = this;
    var xd = d3.interpolate(this.x.domain(), [d.x, d.x + d.dx]),
        yd = d3.interpolate(this.y.domain(), [d.y, 1]),
        yr = d3.interpolate(this.y.range(), [d.y ? 20 : 0, that.radius]);
    return function(d, i) {
        return i
            ? function(t) { return that.arc(d); }
            : function(t) { that.x.domain(xd(t)); that.y.domain(yd(t)).range(yr(t)); return that.arc(d); };
    };
}
