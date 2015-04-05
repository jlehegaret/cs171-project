TimelineVis = function(_parentElement, _data, _eventHandler, _options) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.options = _options;
    this.displayData = [];

    var options = _options || {width:800, height:100};

    // defines constants
    this.margin = {top: 20, right: 20, bottom: 20, left: 20};
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

    // filter, aggregate, modify data
    this.wrangleData();
    // call the update method
    this.updateVis();
};

TimelineVis.prototype.wrangleData = function() {
    var that = this;

};

TimelineVis.prototype.updateVis = function() {
    var that = this;

};