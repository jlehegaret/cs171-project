WhoVis = function(_parentElement, _data, _eventHandler, _options) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.options = _options || {width:800, height:500};
    this.displayData = [];
    this.allIssues = [];

    // defines constants
    this.margin = {top: 20, right: 10, bottom: 20, left: 50};
    this.width = this.options.width - this.margin.left - this.margin.right;
    this.height = this.options.height - this.margin.top - this.margin.bottom;

    this.initVis();
};

WhoVis.prototype.initVis = function() {
    var that = this;

    this.dateFormatter = d3.time.format("%Y-%m-%d");

    this.svg = this.parentElement.append("svg")
        .attr("width", this.width + this.margin.left + this.margin.right)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + (this.margin.left + this.margin.right + this.width)/2 + "," +(this.margin.top + this.margin.bottom + this.height)/2 + ")");

     this.x = d3.scale.linear().range([0, this.width/2]);
     this.y = d3.scale.ordinal().rangeRoundBands([0, this.height], .2, 0);

    this.color = d3.scale.ordinal()
    .range(["#062B59", "#09458F", "#073874", "#09458F", "#0B52AA", "#0C5FC5"]);
    
    this.x = d3.scale.linear()
        .range([0, this.width/2]);

    this.y = d3.scale.ordinal()
        .rangeRoundBands([0, this.height], .2, 0);

    this.xAxis = d3.svg.axis()
    .scale(this.x)
    .ticks(5)
    .orient("top");

    this.group = this.svg.append("g")
        .attr("class", "bars");

    this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + -10 + ")");   

    // filter, aggregate, modify data
    this.wrangleData(null);
    // call the update method
    this.updateVis();
};


WhoVis.prototype.wrangleData = function(_filterFunction) {
   this.displayData = this.filterAndAggregate(_filterFunction);
 
};

WhoVis.prototype.updateVis = function() {
    var that = this;

     this.max = d3.max(this.displayData, function(d) { return d.sum; } );
     this.min = d3.min(this.displayData, function(d) { return d.sum; } );

    this.x.domain([this.min, this.max]);
    this.y.domain(this.displayData.map(function(d) { return d.author; }));

    this.svg.select(".x.axis")
        .call(this.xAxis)
        .selectAll("text");  

    
    var bar = this.group.selectAll(".bar")
        .data(this.displayData, function(d) { return d.author; });   
     
    var bar_enter = bar.enter().append("g");

    bar_enter.append("rect");
    bar_enter.append("text");

    bar
        .attr("class", "bar");

    bar.exit()
        .remove();    

    bar
        .attr("class", "bar")
        .attr("transform", function(d, i) { return "translate(0," + that.y(d.author) + ")"; });
    

    bar.selectAll("rect")
        .attr("height", 10)
        .attr("x", 0)
        .attr("y", 0)
        .style("fill", function(d){
            return that.color(d.author)
        })
        .transition()
        .delay(function(d, i) { return i * 10; })
        .attr("width", function(d) { return that.x(d.sum); });   


    bar.selectAll("text")
            .text(function(d){return d.author})
            .style("font-size", "9px")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "0.8em")
            .style("font-family", "sans-serif");      

    };

WhoVis.prototype.onSelectionChange = function(selectionStart, selectionEnd) {
    this.wrangleData(function(d) {return new Date(d.created_at) >= selectionStart && new Date(d.created_at) <=selectionEnd});
    this.updateVis();
};

WhoVis.prototype.filterAndAggregate = function(_filter){

    var filter = function(){return true;}
    if (_filter != null){
        filter = _filter;
    }

    var that = this;

    var authors = [];    

        this.data.specs
          .filter(filter)
        .forEach(function(d){

            //console.log(d)

            if(d.issues != undefined){

            d.issues.map(function(d){

                    if(d.line_added != undefined){

                authors.push({

                    author: d.author["login"],
                    sum: d.line_deleted +  d.line_added

             })
            }
          })
        }
      }) 

          var temp = {};
          var obj = null;
          var result = [];

                for(var i=0; i < authors.length; i++) {
                   obj=authors[i];

                   if(!temp[obj.author]) {
                       temp[obj.author] = obj;
                   } else {
                       temp[obj.author].sum += obj.sum;
                   }
                }
                
                for (var prop in temp){

                    result.push(temp[prop]);
                    result.sort(function(a, b) {return b.sum - a.sum});

                }
             
               return result.slice(0,19);

}



