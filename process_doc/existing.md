# Section 3 - What W3C Has So Far

* *return to [Section 2, The Data](data.md)*
* *proceed to [Section 4, Our Design Ideas](design.md)*


W3C currently relies upon this graph:

[http://testthewebforward.org/dashboard/#all](http://testthewebforward.org/dashboard/#all)

By default, this shows the amount of code committed to the overall W3C test suite.  Gray is code that is part of the W3C repository, while red marks code that is waiting as a pull request.  Dark gray shows us the overall number of open issues.

By using the dropdown box, you can choose to see instead information per-spec or per-working group.  Every item that starts "wg-" is a working group (and each working group may work on many specs), while **every other** item in the dropdown is one particular spec.

We aim to provide a more accessible way to search the data than this one, lengthy drop-down box.  We also aim to provide a narrowing in of time zone, and seeing multiple data in the "now" timeframe rather than seeing just one set of data over time.

Also, this graph only represents the status of the test suite.  However, W3C needs to know a lot more about each spec (and working group's efforts) than that.  So far, they have generated hard-coded table reports from time-to-time to provide them such an overview.

Here are three examples of those per-working group table reports:

[Web Apps Working Group](https://jlehegaret.github.io/cs171-project/sample_repts/webapps.html)

[Web Performance Working Group](https://jlehegaret.github.io/cs171-project/sample_repts/webperf.html)

[Web RTC Working Group](https://jlehegaret.github.io/cs171-project/sample_repts/webrtc.html)

In each of these reports, we see, sorted by Spec status (WD = Working Draft, LCWD = "Last Call Working Draft", CR = "Candidate Recommendation", and REC = "Recommendation):

* the name of the spec, with link to its latest published version
* the date of that last publication
* its status
* the last update to an unpublished draft
* the number of issues in GitHub, for those specs hosted in GitHub
* some notes (mainly noting when the published version is much older than the latest update)

We aim to incorporate all of this information into one screen:  spec information, test information, and caniuse information.  And we aim to make it easy to compare the information at different levels - across W3C, within a working group, or for just one spec.


