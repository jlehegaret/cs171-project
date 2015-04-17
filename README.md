W3C - Test the Web Forward

The CS 171 Group Project created by

Jennifer Le Hegaret
Zona Kostic
John Greeley


What We Want To Do

W3C is a standards organization responsible for the specifications that form the backbone of the web - HTML, CSS, Accessibility, and Security, just to name a few.

We aim to provide W3C with a tool to monitor its own work developing those specifications.  We want to help them push the web forward by being able to identify things like:
- which specs are the most active
- which ones are languishing
- who is doing most of the work
- what is the longest outstanding unresolved issue


Why We Want To Do It

At the abstract level:  Jennifer has personal ties to W3C and is motivated to be of help to them.  Zona respects W3C's accomplishments and wanted her work on this project to be meaningful in the real world.  John has previously worked with W3C specifications and is also willing to support the W3C's mission.

At the practical level:  this task has a wonderfully robust data set crying out for a better visualization than the ones W3C currently has.  It seems a perfect project in terms of its accessibility as well as its scope and usefulness.

How We Are Going To Do It

We focus on W3C's specification-related work that is hosted in GitHub, and we already have JSON files containing this data.

Our Visualization represents the amount of editorial work that is done on the Spec itself (which is written in HTML code) and the amount of coding done to create a test suite for that Spec (which is written in JavaScript).

It consists of three parts working together:

a sunburst tree, to show the amount and types of work done and/or to do by working group and/or by spec

a timeline, to show the amounts and types of work done over time, including "last published" dates

a barchart/list, to show WHO has done how much of which kind of work

Each of these pieces allow the user to redefine the data that is displayed by all the pieces, to provide consistent yet specific representations.

For more details, please read our main document.

