# anu-timetable
A web app that tells you when your next ANU lecture or tutorial is.
All times are automatically shown in the timezone of your device.
The timetable supports selecting tutorials, workshops, and labs, and has clickable Google Maps links for directions to each location displayed.

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