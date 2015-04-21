WhoVis = function(_parentElement, _data, _eventHandler, _options) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.options = _options;
    // TEMPORARY
    this.options = {  "start_date"  : "2014-01-01",
                      "end_date"    : "2015-05-05",
                      "categories"  : ["spec", "test"],
                      "actions"     : ["ISS_O", "ISS_C",
                                       "PR_O", "PR_C",
                                       "COM", "PUB"],
                      "specs"       : [],
                      "who"         : [],
                      "number_who"  : 20,
                      "width"       : 300,
                      "height"      : 900
                    };
    this.displayData = [];

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
        .attr("transform", "translate("
              + (this.margin.left + this.margin.right + this.width)/2
              + ","
              + this.margin.top + ")");

     this.x = d3.scale.linear().range([0, this.width/2]);
     this.y = d3.scale.ordinal().rangeRoundBands([0, this.height], .2, 0);

    this.color = d3.scale.ordinal()
    .range(["#062B59", "#09458F", "#073874", "#09458F", "#0B52AA", "#0C5FC5"]);

    this.x = d3.scale.linear()
        .range([0, this.width/2]);

    this.y = d3.scale.ordinal()
        .rangeRoundBands([0, this.height], .2, 0);

    // this.xAxis = d3.svg.axis()
    // .scale(this.x)
    // .ticks(5)
    // .orient("top");

    this.group = this.svg.append("g")
        .attr("class", "bars");

    // this.svg.append("g")
    //     .attr("class", "x axis")
    //     .attr("transform", "translate(0," + -10 + ")");

    // filter, aggregate, modify data
    this.wrangleData();
    // call the update method
    this.updateVis();
};


WhoVis.prototype.updateVis = function()
{
    var that = this;

    // CURRENTLY, WE ARE JUST SHOWING LINES OF CODE
    //   we would need to expand this to include issues someday
     this.max = d3.max(this.displayData, function(d)
                        { return d.total_code; } );
     this.min = d3.min(this.displayData, function(d)
                        { return d.total_code; } );

    this.x.domain([this.min, this.max]);
    this.y.domain(this.displayData.map(function(d)
                        { return d.who; }));

    // this.svg.select(".x.axis")
    //     .call(this.xAxis)
    //     .selectAll("text");


    var bar = this.group.selectAll(".bar")
        .data(this.displayData, function(d)
                        { return d.who; });

    var bar_enter = bar.enter().append("g");

    bar_enter.append("rect");
    bar_enter.append("text");

    bar
        .attr("class", "bar");

    bar.exit()
        .remove();

    bar
        .attr("class", "bar")
        .attr("transform", function(d, i)
            { return "translate(0," + that.y(d.who) + ")"; });


    bar.selectAll("rect")
        .attr("height", 10)
        .attr("x", 0)
        .attr("y", 0)
        .style("fill", function(d){
            return that.color(d.who)
        })
        .transition()
        .delay(function(d, i) { return i * 10; })
        .attr("width", function(d) {
console.log("d.total_code is");
console.log(d.total_code);
console.log("result is");
console.log(that.x(d.total_code));
          return that.x(d.total_code); });


    bar.selectAll("text")
            .text(function(d){return d.who})
            .style("font-size", "9px")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "0.8em")
            .style("font-family", "sans-serif");

    };

WhoVis.prototype.onSelectionChange = function(selectionStart, selectionEnd) {
    this.wrangleData();
    this.updateVis();
};



WhoVis.prototype.wrangleData = function()
{
  var that = this;

  function findWho(name, type)
  {
    var found = false;
    for(var i = 0; i < that.displayData.length; i++)
    {
      if(that.displayData[i].who == name)
      {
        return i;
      }
    }

    // if we're here, we need to create a new element
    //  PERHAPS WE WOULD GET RID OF DETAILS FOR PRODUCTION
    that.displayData.push(
      { "who"          : name,
        "total_code"   : 0,
        "total_issues" : 0,
        "work"         : [ { "cat"   : "spec",
                              "type"  : "COM",
                              "scale" : "code",
                              "details" : [],
                              "total" : 0 },
                            { "cat"  : "spec",
                              "type" : "PR_O",
                              "scale": "code",
                              "details" : [],
                              "total" : 0 },
                            { "cat"  : "spec",
                              "type" : "PR_C",
                              "scale": "code",
                              "details" : [],
                              "total" : 0 },
                            { "cat"  : "spec",
                              "type" : "ISS_O",
                              "scale": "count",
                              "details" : [],
                              "total" : 0 },
                            { "cat"  : "spec",
                              "type" : "ISS_C",
                              "scale": "count",
                              "details" : [],
                              "total" : 0 },
                            { "cat"   : "test",
                              "type"  : "COM",
                              "scale" : "code",
                              "details" : [],
                              "total" : 0 },
                            { "cat"  : "test",
                              "type" : "PR_O",
                              "scale": "code",
                              "details" : [],
                              "total" : 0 },
                            { "cat"  : "test",
                              "type" : "PR_C",
                              "scale": "code",
                              "details" : [],
                              "total" : 0 },
                            { "cat"  : "test",
                              "type" : "ISS_O",
                              "scale": "count",
                              "details" : [],
                              "total" : 0 },
                            { "cat"  : "test",
                              "type" : "ISS_C",
                              "scale": "count",
                              "details" : [],
                              "total" : 0 } ]
      });

    return (that.displayData.length - 1);
  }

  function processData(d, category)
  {
    var who;
    var index;
    var plus;  // need to change element number depending
              // on category being processed
    (category === "spec")
    ? plus = 0
    : plus = 5;

    if(d.commits && that.options.actions.indexOf("COM") !== -1)
    {
      d.commits.forEach(function(c)
      {
          who = that.displayData[findWho(c.author)];
          who.total_code += (c.line_added + c.line_deleted);
          who.work[0 + plus].total += (c.line_added + c.line_deleted);
          who.work[0 + plus].details.push(c);
      });
    }

    if( (category == "spec" && d.issues)
        || category == "test")
    {
      var process;

      (d.issues)
      ? process = d.issues
      : process = [d];
      process.forEach(function(c)
      {
        // is it a PR or an issue
        if(c.type === "pull" || c.type === "test")
        {
          if(!c.line_added || !c.line_deleted)
          {
            if(c["line added"]) { c.line_added = c["line added"]; }
            if(c["line deleted"]) { c.line_deleted = c["line deleted"]; }
          }
          if(!c.line_added || !c.line_deleted)
          {
            // console.log("Problem with line_added or line_deleted:");
            // console.log(c);
          }
          else
          if( that.options.actions.indexOf("PR_O") !== -1
              && c.created_at >= that.options.start_date)
          {
            // who created it
            who = that.displayData[findWho(c.author.login)];
            who.total_code += (c.line_added + c.line_deleted);
            who.work[1 + plus].total += (c.line_added + c.line_deleted);
            who.work[1 + plus].details.push(c);
          }
          if(!c.line_added || !c.line_deleted)
          {
            if(c["line added"]) { c.line_added = c["line added"]; }
            if(c["line deleted"]) { c.line_deleted = c["line deleted"]; }
          }
          if(!c.line_added || !c.line_deleted)
          {
            // console.log("Problem with line_added or line_deleted:");
            // console.log(c);
          }
          else
          if(c.closed_at)
          {
            //  OUR DATA IS NOT PERFECT.  IF A PR IS NOT MERGED
            //    WE ACTUALLY DON'T KNOW WHO CLOSED IT
            if(c.merged_by)
            {
              // who possibly closed it
              if( that.options.actions.indexOf("PR_C") !== -1
                && c.closed_at <= that.options.end_date)
              {
                who = that.displayData[findWho(c.merged_by.login)];
                who.total_code += (c.line_added + c.line_deleted);
                who.work[2 + plus].total += (c.line_added + c.line_deleted);
                who.work[1 + plus].details.push(c);
              }
            }
            // else
            // {
            //   console.log("Need closed by name");
            //   console.log(c);
            // }
          }
        }
        else if(c.type === "issue") // CURRENTLY, ONLY HAVE OPENING DATA
        {
          // how hard is it
          var value;
          if(c.difficulty)
          {
            (c.difficulty === "easy")
            ? value = 1
            : value = 2
          }
          else // not flagged, flag it this way
          {
            value = 3;
          }

          if(that.options.actions.indexOf("ISS_O") !== -1
              && c.created_at >= that.options.start_date)
          {
            // when was it created
            who = that.displayData[findWho(c.author.login)];
            who.total_issues += value;
            who.work[3 + plus].total += value;
            who.work[3 + plus].details.push(c);
          }
          // if(c.closed_at
          //    && c.??? <= that.options.end_date)
          // {
          // when was it possibly closed
          // if(that.options.actions.indexOf("ISS_C") !== -1)
          // {
             // NEED DATA FOR THIS TO CODE FOR IT
          // }
          // }
        }
        else { console.log("What is this?"); console.log(c); }
      });
    } // end of d.issues work
  }

  // CALL HELPER FUNCTIONS
  that.displayData = [];
  if(that.options.categories.indexOf("spec") !== -1)
  {
    that.data.specs.forEach(function(d)
    {
      if(that.options.specs.length == 0
         || that.options.specs.indexOf(d.url) != -1)
      {
        processData(d, "spec");
      }
    });
  }
  if(that.options.categories.indexOf("test") !== -1)
  {
    that.data.tests.forEach(function(d)
    {
      if(that.options.specs.length == 0)
      {
// console.log("processing test data for ");
// console.log(d);
         processData(d, "test");
      }
      else // we need to check that a spec we care about is concerned
      {
        var found = false;
        var i = 0;
        while(!found && i < this.options.specs.length)
        {
          if(that.options.specs.indexOf(d.specs[i]) !== -1)
          {
            found = true;
          }
          else
          {
            i++; // keep looking
          }
        }
        if(found) { processData(d, "test"); }
      }
    });
  }

console.log("Who data before sort");
console.log(this.displayData);

  this.displayData.sort(function(a, b)
                  { return b.total_code - a.total_code; });
  // TAKING ROBIN BERJON OUT, AS HE IS A HUGE OUTLIER.  OR, WE SHOULD JUST
  //   BY HAND TAKE OUT HIS HUGEST MOVE OF THE REPOS
  this.displayData = this.displayData.slice(1, this.options.number_who);

console.log("Who data after sort");
console.log(this.displayData);
}

