# anu-timetable
A web app that tells you when your next ANU lecture or tutorial is.
All times are shown in the timezone of your device, and links to your timetable can be shared at will.
The timetable supports selecting tutorials, workshops, and labs.
It also has Google Maps links for directions to each location displayed.
Notes can be stored for each activity by clicking on it in the calendar.
Each upcoming activity is displayed below the calendar with the time until its commencement.

Check out the website [here](https://tusharmurali.github.io/anu-timetable/).

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Maintenance
A scrape is required using the `scraper` during the end of each year to load the data for the next year.