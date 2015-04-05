TimelineVis = function(_parentElement, _data, _eventHandler, _options) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.options = _options;
    this.displayData = [];

    var options = _options || {width:800, height:100};

    // defines constants
    this.margin = {top: 20, right: 20, bottom: 20, left: 50};
    this.width = options.width - this.margin.left - this.margin.right;
    this.height = options.height - this.margin.top - this.margin.bottom;

    this.initVis();
};

TimelineVis.prototype.initVis = function() {
    var that = this;

    // constructs SVG layout
    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

    // creates scales
    this.x = d3.time.scale()
        .range([0, this.width]);
    this.y = d3.scale.linear()
        .range([this.height, 0]);

    // create axes
    this.xAxis = d3.svg.axis()
        .scale(this.x)
        .orient("bottom");
    this.yAxis = d3.svg.axis()
        .scale(this.y)
        .orient("left");

    // Add axes visual elements
    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + this.height + ")");
    this.svg.append("g")
        .attr("class", "y axis")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em");

    // brushing
    this.brush = d3.svg.brush()
        .on("brush", function(){
            $(that.eventHandler).trigger("brushChanged", that.brush.extent());
        });
    this.svg.append("g")
        .attr("class", "brush");


    // filter, aggregate, modify data
    this.wrangleData();
    // call the update method
    this.updateVis();
};

TimelineVis.prototype.wrangleData = function() {
    var that = this;

    this.displayData = this.data.tests;
};

TimelineVis.prototype.updateVis = function() {
    var that = this;

    var dateRange = d3.extent(this.displayData, function(d) {return d.created_at;});

    // updates scale domain
    this.x.domain(dateRange);
//    this.x.nice(d3.time.week);
    this.y.domain(d3.extent(this.displayData, function(d) { return d.line_added; }));

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);
    this.svg.select(".y.axis")
        .call(this.yAxis);

    //updates brush
    this.brush.x(this.x);
    this.svg.select(".brush")
        .call(this.brush)
        .selectAll("rect")
        .attr("height", this.height);
};