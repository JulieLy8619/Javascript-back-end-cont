------------------
# Note lab 8 9 and 10 ended up being done solo and professor stated could be done in one repo
------------------
Number and name of feature: feature 1 and 2 of lab 9
Estimate of time needed to complete: 2hrs
Start time: 10:00
Finish time: 12:15
Actual time needed to complete: 2.25 hrs

Number and name of feature: feature 1
Estimate of time needed to complete: 1 hr
12-1-18
Start time: 9:15
Finish time: 
Actual time needed to complete: 
------------------
------------------
# lab8-back-end-cont

herou deployed link: https://lab8n9n10juliel.herokuapp.com
(reminder when code is working git push heroku master)
note for self: link: https://codefellows.github.io/city_explorer/

# Project Name

**Author**: Julie Ly
**Version**: 1.0.0 (increment the patch/fix version number if you make more commits past your first submission)

## Overview
<!-- Provide a high level overview of what this application is and why you are building it, beyond the fact that it's an assignment for this class. (i.e. What's your problem domain?) -->

## Getting Started
<!-- What are the steps that a user must take in order to build this app on their own machine and get it running? -->

## Architecture
<!-- Provide a detailed description of the application design. What technologies (languages, libraries, etc) you're using, and any other relevant design information. -->

## Change Log
see below

## Credits and Collaborations
- Ryan G helped me with the meet up URL, it was pieced tog by his group
- used https://www.epochconverter.com/programming/#javascript and https://www.w3schools.com/jsref/jsref_obj_date.asp to help with millisecond converter equation 



# lab 8 MD
Lab 08: Persistence with a SQL database
Resources
SQL Syntax Cheatsheet

PostgreSQL Shell Cheatsheet

PostgreSQL Docs

Heroku Postgres Docs

Configuration
.env - with your PORT and API keys. Make sure this file is in your .gitignore so your keys are not pushed to GitHub.
README.md - with documentation regarding your lab and its current state of development. Check the "documentation" section below for more details on how that should look AT MINIMUM
.gitignore - with standard NodeJS configurations
.eslintrc.json - with Code 301 course standards for the linter
package.json - with all dependencies and any associated details related to configuration
Note that the package-lock.json file is automatically created when dependencies are installed and ensures that future installations of the project use the same versions of the dependencies.
lab-08-repository
   ├── .env
   ├── .eslintrc.json
   ├── .gitignore
   ├── package-lock.json
   ├── package.json
   ├── schema.sql
   └── server.js
User Acceptance Tests
Overview
For this lab assignment, you will use the latitude and longitude to request information about movies filmed in the location and Yelp review for local restaurants.

Time Estimate
For each of the features listed below, make an estimate of the time it will take you to complete the feature, and record your start and finish times for that feature:

Number and name of feature: ________________________________

Estimate of time needed to complete: _____

Start time: _____

Finish time: _____

Actual time needed to complete: _____
Add this information to your README.

Repository set-up
One person from your group should create a new repository on GitHub called lab-08-back-end. Add your partner(s) as collaborator(s). Clone your repository.
Follow the same code review process as lab 7.
Heroku Deployment
Once your app is functioning correctly on your master branch, deploy your back end to Heroku in the same manner as labs 6 and 7. Create a new Heroku instance with your new partner(s) today. Your deployed site should not contain any broken functionality.
You will also need to provision a SQL database on Heroku. See the notes, below, about using PostgreSQL with Heroku.
As you continue to work on features, make sure to check out your master branch and pull the changes after each pull request is merged. Then, create a new branch from your master branch and continue working. You may now begin your feature tasks for lab 8.
Feature #1: Caching data
Why are we implementing this feature?
As a user, I want the application to perform quickly so that I can search for locations frequently and reliably.
What are we going to implement?
Given that a user enters a valid location in the input
When the user clicks the "Explore!" button
Then the results will be loaded from a SQL database, if previously cached

Given that a user enters a valid location in the input
When the user clicks the "Explore!" button
Then the results will be requested from each individual API, if not previously cached

Given that a user enters a valid location in the input
When the user clicks the "Explore!" button
Then the results will be cached in a SQL database for future retrieval

Given that a user does not enter a valid location in the input
When the user clicks the "Explore!" button
Then the location information will not be displayed

How are we implementing it?
Database set-up:

Install and require the NPM PostgreSQL package pg in your server.js file.
Add your connection string to your .env file as your DATABASE_URL.
Windows and Linux users: You should have retained the user/password from the pre-work for this course. Your OS may require that your connection string is composed of additional information including user and password. For example: postgres://USER:PASSWORD@HOST:PORT/DBNAME;
Mac users: postgres://localhost:5432/DBNAME;
Pass the appropriate argument when instantiating a new Client.
Table creation:

Create a file called schema.sql which contains correct SQL queries to drop all of your tables and create them, if they do not already exist. All tables should be created in the same database.
Execute this file from the command line with the following syntax: psql -d <database-name> -f <filename>.
For example, psql -d city_explorer -f schema.sql
Server logic:

Create a function to check the database for the location information.
If the location record already exists in the database, send the location object in the response to the client.
It it does not exist in the database, request the data from the API, save it in the database, and then send the location object in the response to the client.
For all of your other models, write a single lookup function that is dynamic and can be shared by all of the models. This lookup function should accept several options:
The search query
A function to execute if the records exist in the table
A function to execute if the records do not exist in the table.
Within your route callback, invoke your lookup function, passing the appropriate options.
If the records exist, send them as the response to the client.
If the records do not exist, request the data from the appropriate APIs, as you have in labs 6 and 7. Store the results in the appropriate table in your database and send the API results as the response to the client.
Redeploy your application.
Postgres on Heroku
In your Heroku instance, navigate to the Resources tab. In the Add-Ons, search for "Postgres" and provision the free version.

Replicate your local database to Heroku, using the following format for your command: heroku pg:push city_explorer DATABASE_URL --app <your-heroku-app-name-here>

Note: Unless the local database is pushed to Heroku again, any changes to the local database will not be reflected in the production database.
To work with the remote database on your machine, use the following format for your command. Use the same DATABASE_URL variable from the push command, but you must provide the name of a new table that does not already exist to serve as the destination of the data pull. This will prevent you from overwriting your existing local data.

heroku pg:pull DATABASE_URL <new-local-empty-database-name>
Documentation
Your README.md must include:

# Project Name

**Author**: Your Name Goes Here
**Version**: 1.0.0 (increment the patch/fix version number if you make more commits past your first submission)

## Overview
<!-- Provide a high level overview of what this application is and why you are building it, beyond the fact that it's an assignment for this class. (i.e. What's your problem domain?) -->

## Getting Started
<!-- What are the steps that a user must take in order to build this app on their own machine and get it running? -->

## Architecture
<!-- Provide a detailed description of the application design. What technologies (languages, libraries, etc) you're using, and any other relevant design information. -->

## Change Log
<!-- Use this area to document the iterative changes made to your application as each feature is successfully implemented. Use time stamps. Here's an examples:

01-01-2001 4:59pm - Application now has a fully-functional express server, with a GET route for the location resource.

## Credits and Collaborations
<!-- Give credit (and a link) to other people or resources that helped you build this application. -->
-->
Submission Instructions
Complete your Feature Tasks for the day
Create a Pull Request (PR) back to the master branch of your repository
On Canvas, submit a link to your PR and a link to your deployed application on Heroku. Add a comment in your Canvas assignment which includes the following:
A question within the context of today's lab assignment
An observation about the lab assignment, or related 'Ah-hah!' moment
How long you spent working on this assignment
------------------

# lab 9 MD
Lab 09: Cache Invalidation
Resources
SQL Syntax Cheatsheet

PostgreSQL Shell Cheatsheet

PostgreSQL Docs

Meetup API Docs

Hiking Project API Docs

Configuration
.env - with your PORT and API keys. Make sure this file is in your .gitignore so your keys are not pushed to GitHub.
README.md - with documentation regarding your lab and its current state of development. Check the "documentation" section below for more details on how that should look AT MINIMUM
.gitignore - with standard NodeJS configurations
.eslintrc.json - with Code 301 course standards for the linter
package.json - with all dependencies and any associated details related to configuration
Note that the package-lock.json file is automatically created when dependencies are installed and ensures that future installations of the project use the same versions of the dependencies.
lab-09-repository
   ├── .env
   ├── .eslintrc.json
   ├── .gitignore
   ├── package-lock.json
   ├── package.json
   ├── schema.sql
   └── server.js
User Acceptance Tests
Overview
For this lab assignment, you will use the latitude and longitude to request information about meetups hosted in the area and hiking trails and campgrounds near the location.

Time Estimate
For each of the features listed below, make an estimate of the time it will take you to complete the feature, and record your start and finish times for that feature:

Number and name of feature: ________________________________

Estimate of time needed to complete: _____

Start time: _____

Finish time: _____

Actual time needed to complete: _____
Add this information to your README.

Repository set-up
One person from your group should create a new repository on GitHub called lab-09-back-end. Add your partner(s) as collaborator(s). Clone your repository.
Follow the same code review process as lab 8.
Heroku Deployment
Once your app is functioning correctly on your master branch, deploy your back end to Heroku in the same manner as labs 6, 7, and 8. Create a new Heroku instance with your new partner(s) today. Your deployed site should not contain any broken functionality.
You will also need to provision a SQL database on Heroku, as you did in lab 8
As you continue to work on features, make sure to check out your master branch and pull the changes after each pull request is merged. Then, create a new branch from your master branch and continue working. You may now begin your feature tasks for lab 9.
Feature #1: Retrieve Meetup information
Why are we implementing this feature?
As a user, I want to request information about meetups in the area so that users can learn about the events taking place in the location.
What are we going to implement?
Given that a user enters a valid location in the input
When the user clicks the "Explore!" button
Then the first twenty Meetups hosted in the area will be displayed in the browser

How are we implementing it?
Create a route with a method of get and a path of /meetups. The callback should make a Superagent-proxied request to the Meetup API using the necessary location information.
Create a corresponding constructor function for the result.
For each meetup of the result, return an object which contains the necessary information for correct client rendering. See the sample response, below.
This model should use the same lookup function as your other models.
Use your existing error handler function.
Redeploy your application.
Endpoint: /meetups

Example Response:

[
  {
    "link": "https://www.meetup.com/seattlejshackers/events/253823797/",
    "name": "SeattleJS Hackers",
    "creation_date": "Wed Apr 23 2014",
    "host": "Hackers"
  },
  {
    "link": "https://www.meetup.com/Angular-Seattle/events/253595182/",
    "name": "Angular Seattle",
    "creation_date": "Tue May 09 2017",
    "host": "Angulars"
  },
  ...
]
Feature #2: Retrieve trail information
Why are we implementing this feature?
As a user, I want to request information about trails and campgrounds in the area so that users can explore the location.
What are we going to implement?
Given that a user enters a valid location in the input
When the user clicks the "Explore!" button
Then the first ten hikes and campgrounds in the area will be displayed in the browser

How are we implementing it?
Create a route with a method of get and a path of /trails. The callback should make a Superagent-proxied request to the Hiking Project API using the necessary location information.
Create a corresponding constructor function for the result.
For each trail of the result, return an object which contains the necessary information for correct client rendering. See the sample response, below.
This model should use the same lookup function as your other models.
Use your existing error handler function.
Redeploy your application.
Endpoint: /trails

Example Response:

[
  {
    "name": "Rattlesnake Ledge",
    "location": "Riverbend, Washington",
    "length": "4.3",
    "stars": "4.4",
    "star_votes": "84",
    "summary": "An extremely popular out-and-back hike to the viewpoint on Rattlesnake Ledge.",
    "trail_url": "https://www.hikingproject.com/trail/7021679/rattlesnake-ledge",
    "conditions": "Dry: The trail is clearly marked and well maintained.",
    "condition_date": "2018-07-21",
    "condition_time": "0:00:00 "
  },
  {
    "name": "Mt. Si",
    "location": "Tanner, Washington",
    "length": "6.6",
    "stars": "4.4",
    "star_votes": "72",
    "summary": "A steep, well-maintained trail takes you atop Mt. Si with outrageous views of Puget Sound.",
    "trail_url": "https://www.hikingproject.com/trail/7001016/mt-si",
    "conditions": "Dry",
    "condition_date": "2018-07-22",
    "condition_time": "0:17:22 "
  },
  ...
]
Feature #3: Cache invalidation
Why are we implementing this feature?
As a user, I want to view up-to-date information so that I receive accurate details.
What are we going to implement?
Given that a user enters a valid location in the input
When the user clicks the "Explore!" button
Then the most recent data will be displayed in the browser

How are we implementing it?
Update each model to include a new property to keep track of when the record was added to the database. Drop your tables and re-create them to include this new property. Update the save function for each model.
Create a dynamic function to delete records from a specific table. This function should be shared by all of your models.
For each model, refactor the function that is invoked if the records exist in the database in the following manner:
This function should now include the necessary logic to determine how long ago the records were created and stored.
For each model, decide how long each table's records should be stored. These durations should be based on the data each API provides. Some data should be stored for a shorter period of time, while others will not change as frequently.
If the records exceed this amount of time, remove only the records that correspond to the user's search query, while leaving the records from other search queries as-is. Request a new set of data from the API.
If the records do not exceed this amount of time, send the records in your response to the client.
Documentation
Your README.md must include:

# Project Name

**Author**: Your Name Goes Here
**Version**: 1.0.0 (increment the patch/fix version number if you make more commits past your first submission)

## Overview
<!-- Provide a high level overview of what this application is and why you are building it, beyond the fact that it's an assignment for this class. (i.e. What's your problem domain?) -->

## Getting Started
<!-- What are the steps that a user must take in order to build this app on their own machine and get it running? -->

## Architecture
<!-- Provide a detailed description of the application design. What technologies (languages, libraries, etc) you're using, and any other relevant design information. -->

## Change Log
<!-- Use this area to document the iterative changes made to your application as each feature is successfully implemented. Use time stamps. Here's an examples:

01-01-2001 4:59pm - Application now has a fully-functional express server, with a GET route for the location resource.

## Credits and Collaborations
<!-- Give credit (and a link) to other people or resources that helped you build this application. -->
-->
Submission Instructions
Complete your Feature Tasks for the day
Create a Pull Request (PR) back to the master branch of your repository
On Canvas, submit a link to your PR and a link to your deployed application on Heroku. Add a comment in your Canvas assignment which includes the following:
A question within the context of today's lab assignment
An observation about the lab assignment, or related 'Ah-hah!' moment
How long you spent working on this assignment
------------------

# lab 10 MD

