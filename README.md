# Letterboxd Data Visualization

## The Motivation
 
In the past two years I have been using [Letterboxd](https://letterboxd.com) to log my daily film viewings. Letterboxd, like imdb, is a global social network for grass-roots film discussion and discovery. It has all the wonderful features I need: watched date specification, support for logging rewatched films, tag managment, and a wonderful online community. I particularly love their stats service, where subcribers can have a look at their film viewing data visualizations, ranging from the bar charts of genres, countries & languages, pie charts of watches vs re-watches, world map with heat color, etc. And yet, there are some custom data visualizations I am hoping to see, like the calendar heapmap, pie charts for how I watched I a film, in theatre or on a streaming platform. 

## Dependencies

You will need Node.js to run it locally, so please install Node.js if you haven't done so yet. Node.js comes with a tool called NPM (Node Package Manager), which you can use to install HTTP server package.

## Run it Locally 

Once you have cloned the directory, install the NPM module `express`. To install:
```
npm install express
``` 

You should see a `/node_modules` directory once you've installed them. 

To run (from your local directory):
```
node index.js
``` 

This will serve files from the current directory at localhost under port 8000, i.e in the address bar type:
```
http://localhost:8000
``` 

## Demo
Check out the demo and create process [here](https://cindyshi.myportfolio.com/film-viewing-data-visualization)!