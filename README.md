# CS-171 Project Proposal
=========================
Help the W3C (and get your name in lights)!

How would you like to help out the organization that sets the standards for all this web technology we are using and learning?

We have an opportunity to replace the graph on this website:

[http://testthewebforward.org/dashboard/#all](http://testthewebforward.org/dashboard/#all)

with our CS 171 project!  W3C would like to combine a lot of information from a lot of different places in order to answer questions like these:

- how many open issues are there for a particular working group or spec?  Are these easy or hard issues to address?
- how well implemented is a spec, according to caniuse.com?
- how many lines of test code or spec updates have been committed by a particular working group?  For all specs, or for a particular spec?
- who is contributing?
- what progress has happened over time (overall, or for a particular spec)?
- can we compare working group's levels of activity to each other?

All of the data to answer these questions is public and, thanks to some W3Cers who are motivated to help us, even in ready-to-use JSON format.


# Background Info
=================
W3C works on a huge number of specs.  What we think of as HTML, CSS, and JavaScript is splintered across all of these various documents.  Browser developers use these documents to know how to build their browsers, and we students use them to learn how to write our code so that it will work in the browswers.

Each spec is shepherded along by at least one "working group".  As the ideas in each spec are more and more universally adopted by the various browser vendors (due to the spec changing to reflect market reality as well as enough browsers "catching up" to the spec), the spec moves along from "draft" to "recommendation."  A spec's attainment of "Recommendation" status is what really moves the web forward, as developers everywhere then have a firm and universal bedrock upon which to build.

We are going to help monitor three forces that help move a spec to "Recommendation" status:
- how many JavaScript tests have been written for that spec
- how many edits the spec itself has received
- what does caniuse.com have to say about the implementation of the features in the spec

### JavaScript tests

Loads of people are pitching in to write tests about each spec.  These tests help the browser vendors judge how well they have implemented each spec.  The tests are housed in GitHub here:

[https://github.com/w3c/web-platform-tests](https://github.com/w3c/web-platform-tests)

Every single folder in that list is a spec!

The exact scope of test coverage per spec, and whether the tests pass or fail on which browsers is currently out of the scope of this project (we will use caniuse.com to proxy that information).  However, thanks to the GitHub API, we can see who is committing how many lines of code for each spec and when.  We can also see how many pull requests are still outstanding.

### Issues with JavaScript tests

At the very top of this repository are issues that people have raised about the test-suite:

[https://github.com/w3c/web-platform-tests/issues](https://github.com/w3c/web-platform-tests/issues)

These have been tagged with information about
- to which spec does the issue pertain (the gray label(s))
- which working group needs to resolve the issue (the blue label that starts with a "wg")
- how hard is the issue to address - this helps testwriters know which are the low-hanging fruit they can easily take care of

Based on these tags and thanks to the GitHub API, we can determine how many open issues a given spec (or working group) has, who raised the issue, who closed the issue, how long it took to address the issue, and do all of that by difficulty level as well.

Just in case you are interested, here is [some very raw GitHub data about testsuite issues](sample_data/wpt-issues.json), but we will get a more tailored JSON.

### The Specs themselves

Every single W3C spec that has a GitHub repository will be included in our dataset.  One example of a spec repository is here:

[https://github.com/w3c/webcomponents](https://github.com/w3c/webcomponents)

Luckily, our friends at the W3C will take care of conglomerating all of the interesting information from each repository into one JSON file for us.  Same as for each spec's test suite, for each spec itself we can see who committed a change when, how many lines of text were affected, and how many pull requests are still outstanding.  And this time, the number of issues is even easier to analyze, as the issues for the spec-specific repository are obviously for that particular spec:

[https://github.com/w3c/webcomponents/issues](https://github.com/w3c/webcomponents/issues)

### CanIUse Data

[http://caniuse.com/](http://caniuse.com/) is a great resource for web developers to learn how long ago a spec's feature has been adopted so as to determine whether or not workarounds for older browsers will be necessary or not.

For example, if we look at [SVG fonts](http://caniuse.com/#feat=svg-fonts) and click on the Resources tab at the bottom of the screen, we see **Specification [w3.org]**, which links to the exact section of the appropriate spec detailing that feature.

The CanIUse API will let us access this data so that we can report, per spec, the status of any and all features that CanIUse has cataloged for that spec.

# What Do They Have So Far?
===========================

Let's look again at that graph:

[http://testthewebforward.org/dashboard/#all](http://testthewebforward.org/dashboard/#all)

By default, this shows the amount of code committed to the overall W3C test suite.  Gray is code that is part of the W3C repository, while red marks code that is waiting as a pull request.  Dark gray shows us the overall number of open issues.

By using the dropdown box, you can choose to see instead information per-spec or per-working group.  Every item that starts "wg-" is a working group (and each working group may work on many specs), while **every other** item in the dropdown is one particular spec.

Clearly, we can provide a more accessible way to search the data than this one, lengthy drop-down box!  And we can provide narrowing in of time zone, or seeing multiple data for "now" rather than one set of data over time...

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

It would be great to add in more data to this table - for instance, data about the test suite and caniuse statuses.

Even more critically for **our** purposes, let's see how we can summarize this per-working group information in a more effective visualization.  Even when we may want to be in table view, let's provide some more sorting and filtering options, shall we?!


# Come Join Us
================
If you have read this far, maybe you would like to join our team.  As you can see, there's a lot we can imagine and a lot we can do.  Please come and contribute!

And thanks!!

Jennifer Le Hegaret
