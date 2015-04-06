SpecVis = function(_parentElement, _data, _eventHandler, _options) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.options = _options || {width:800, height:400};
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
SpecVis.prototype.wrangleData = function(specs) {
    var that = this;

    this.displayData = {name:"W3C", children:[]};

    this.data.groups.forEach(function(d) {
        var group = new Object();
        that.displayData.children.push(d);
    });

    console.log(this.displayData);
};

SpecVis.prototype.updateVis = function() {
    var that = this;

    var path = this.svg.datum(this.displayData).selectAll("path")
        .data(this.partition.nodes)
        .enter().append("path")
        .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
        .attr("d", this.arc)
        .style("stroke", "#fff")
        .style("fill", function(d) { return "blue";})
        .style("fill-rule", "evenodd")

};

SpecVis.prototype.onSelectionChange = function(selectionStart, selectionEnd) {

};