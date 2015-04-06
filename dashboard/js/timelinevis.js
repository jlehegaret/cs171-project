TimelineVis = function(_parentElement, _data, _eventHandler, _options) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.options = _options || {width:800, height:100};
    this.displayData = [];
    this.allIssues = [];

    // defines constants
    this.margin = {top: 20, right: 20, bottom: 20, left: 50};
    this.width = this.options.width - this.margin.left - this.margin.right;
    this.height = this.options.height - this.margin.top - this.margin.bottom;

    this.dateFormatter = d3.time.format("%Y-%m-%d");

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
    this.x = d3.time.scale.utc()
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

    // create chart
    this.area = d3.svg.area()
        .interpolate("monotone")
        .x(function(d) { return that.x(that.dateFormatter.parse(d.key)); })
        .y0(this.height)
        .y1(function(d) { return that.y(d.values.length); });

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


//TODO: This is still under construction
TimelineVis.prototype.wrangleData = function(specs) {
    var that = this;

    this.displayData = this.data.specs;

    var issuesTotal=0;
    var issuesClosed=0;
    var issuesOpen=0;

    var allIssues = [];
    this.displayData.forEach(function(d) {
        d.issues.forEach(function(dd) {
            issuesTotal++;
            if(dd.state === "closed") {
                issuesClosed++;
            } else {
                issuesOpen++;
            }
            dd.title = d.title;
            allIssues.push(dd);
        });

    });

    var allIssuesCreated = d3.nest()
        .key(function(d) {return d.created_at;})
        .sortKeys(d3.ascending)
        .entries(allIssues);

    var allIssuesClosed = d3.nest()
        .key(function(d) {return d.closed_at;})
        .entries(allIssues);

    this.displayData = allIssuesCreated;

    console.log(allIssuesCreated);
//    console.log(allIssuesClosed);
//    console.log("Total: " + issuesTotal + ", Open: " + issuesOpen + ", Closed: " + issuesClosed);
};

TimelineVis.prototype.updateVis = function() {
    var that = this;

    var dateRange = d3.extent(this.displayData, function(d) {
        return that.dateFormatter.parse(d.key);
    });


    //var startDate = d3.min(this.displayData, function(d) {
    //    return d3.min(d.issues, function(dd) {
    //        return dd.created_at;
    //    });
    //});
    //var endDate = d3.max(this.displayData, function(d) {
    //    return d3.max(d.issues, function(dd) {
    //        return dd.created_at;
    //    });
    //});

    // updates scale domain
    this.x.domain(dateRange);
//    this.x.nice(d3.time.week);
    this.y.domain(d3.extent(this.displayData, function(d) { return d.values.length; }));


    // updates graph
    var path = this.svg.selectAll(".area")
        .data([this.displayData]);
    path.enter()
        .append("path")
        .attr("class", "area");
    path
        .attr("d", this.area);
    path.exit()
        .remove();

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

TimelineVis.prototype.onSelectionChange = function(specs) {

};