FilterUI = function (_parentElement, _data, _eventHandler, _options) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.options = _options || {width: 800, height: 800};
    this.displayData = {};
    this.allIssues = [];

    // defines constants
    this.margin = {top: 20, right: 20, bottom: 20, left: 50};
    this.width = this.options.width - this.margin.left - this.margin.right;
    this.height = this.options.height - this.margin.top - this.margin.bottom;

    this.initVis();
};

FilterUI.prototype.initVis = function () {
    var that = this;


    // constructs filter ui
    this.ui = this.parentElement.append("form");

    //TODO: Show all issues, open issues, closed issues
};

