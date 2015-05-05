# Section 4 cont. - Our Design Process, the Dashboard

* *return to [The Design Process - Further Details](design_details.md)*
* *proceed to [The Design Process - Sunburst](design_sunburst.md)*


## The Dashboard Itself

One thing to note, which has been helpful during our design decisions, is that we can be sure that our users will in general be viewing our website on extremely large monitor screens, with the occasional laptop-only usage.  Our users are computer programmers by trade and will have all the productivity-enhancing hardware available.  We do not have to worry about supporting mobile.

As we began work, we at first stuck closely to look of the [website](www.testthewebforward/dashboard) that we may eventually replace:

<p align="center">
    <img src="images/Index1.png" width="600"/>
</p>

However, by the time that we met with our TF (or "marker"), we had dared to go a bit more "infovis" style, towards Zona's vision:

<p align="center">
    <img src="images/Index2.png" width="600"/>
</p>

Once the fundamental graphs were in place, Zona was able to spend some time further improving the overall look while Jennifer re-consolidated the timeline in anticipation of taking advantage of the "focus and context" axis recommended by our TF:

<p align="center">
    <img src="images/Index3.png" width="600"/>
</p>


As we continued work on each visualization within the pages, improving focus capabilities and adding descriptive text and legends, the dashboard finally looked like:

<p align="center">
    <img src="images/FINAL_Dashboard.png" width="600"/>
</p>

We have a lot of informative elements now as well as our actual graphs.  We have a legend just under our menu options, and we have a listing in the upper right to summarize all of the applied filters.

All elements on the page communicate with each other and even update the URL, so that we can (pretty much) bookmark a page to show our favorite view of the data.  The one limitation to that is currently the sunburst graph, which does not take an argument as to "zoom level" upon loading.

