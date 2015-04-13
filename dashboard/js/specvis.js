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

    this.color = d3.scale.category20c();

    // constructs SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (this.margin.left + this.margin.right + this.width)/2 + "," +(this.margin.top + this.margin.bottom + this.height)/2 + ")");

    this.radius = Math.min(this.width, this.height) / 2;

    this.partition = d3.layout.partition()
        .size([2 * Math.PI, this.radius * this.radius])
        .value(function(d) { return 1; });

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

    //create a lookup table of specs keyed by url
    this.displayData.lookup_spec = {};
    this.data.specs.forEach(function(d,i) {
        if(that.data.specs[i]){
            that.displayData.lookup_spec[that.data.specs[i].url] = that.data.specs[i];
        } else {
            console.log(that.data.specs[i]);
        }
    });

    this.displayData.root = {name:"W3C", children:[]};

    this.data.groups.forEach(function(d) {
        var group = {};
        group.name = d.name;
        group.shortname = d.shortname;
        group.url = d.url;
        group.children = [];
        d.specs.forEach(function(dd) {
            var spec = {};
            spec.url = dd.url;
            if(that.displayData.lookup_spec[dd.url]) {
                spec.children = that.displayData.lookup_spec[dd.url].issues;
            } else {
                console.log("Spec Not Found Error: " + dd.url);
            }
            group.children.push(spec);
        });
        that.displayData.root.children.push(group);
    });


    console.log(this.displayData.root);

};

SpecVis.prototype.updateVis = function() {
    var that = this;


    var path = this.svg.datum(this.displayData.root).selectAll("path")
        .data(this.partition.nodes)
        .enter().append("path")
        .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
        .attr("d", this.arc)
        .style("stroke", "#fff")
        .style("fill", function(d) {return that.color((d.children ? d : d.parent).name); })
        .style("fill-rule", "evenodd");

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


    this.wrangleData(function(d) {return d.created_at >= selectionStart && d.created_at <=selectionEnd});
    this.updateVis();
};

/**
 * The aggregate function that creates the counts for each age for a given filter.
 * @param _filter - A filter can be, e.g.,  a function that is only true for data of a given time range
 * @returns {Array|*}
 */
SpecVis.prototype.filterAndAggregate = function(_filter){
    var that = this;

    // Set filter to a function that accepts all items
    // ONLY if the parameter _filter is NOT null use this parameter
    var filter = function(){return true;};
    if (_filter != null){
        filter = _filter;
    }
    //Dear JS hipster, a more hip variant of this construct would be:
    // var filter = _filter || function(){return true;}

    var filteredSpecIssues = this.data.specs.forEach(function(spec) {
        if(spec.issues){
            spec.issues = spec.issues.filter(filter);
        }
    });

    return filteredSpecIssues;
};



