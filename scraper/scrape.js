const axios = require('axios')
const cheerio = require('cheerio')
const querystring = require('querystring')
const fs = require('fs')

const httpsAgent = new (require('https')).Agent({ rejectUnauthorized: false })

const year = new Date().getFullYear()

async function scrape() {
    let data = {}
    let response = await axios.get(`http://timetabling.anu.edu.au/sws${year}/`)
    let $ = cheerio.load(response.data)
    const cookie = response.headers['set-cookie'].join('; ')
    let __VIEWSTATE = $('#__VIEWSTATE').val()
    let __EVENTVALIDATION = $('#__EVENTVALIDATION').val()
    response = await axios.post(`http://timetabling.anu.edu.au/sws${year}/`, querystring.stringify({
        '__EVENTTARGET'       : 'LinkBtn_modules',
        '__VIEWSTATE'         : __VIEWSTATE,
        '__EVENTVALIDATION'   : __EVENTVALIDATION
    }))
    $ = cheerio.load(response.data)
    const courses = $('#dlObject option').map(function () { return $(this).val() }).get()
    __VIEWSTATE = $('#__VIEWSTATE').val()
    __EVENTVALIDATION = $('#__EVENTVALIDATION').val()
    console.log('Found ' + courses.length + ' courses')

    const campusMap = (await axios.get('https://www.anu.edu.au/anu-campus-map/list?categories[]=302&categories[]=640')).data
    const knownLocations = new Map()
    while (courses.length > 0) {
        console.log('Getting next 50 courses...')
        response = await axios.post(`http://timetabling.anu.edu.au/sws${year}/`, querystring.stringify({
            '__VIEWSTATE'         : __VIEWSTATE,
            '__EVENTVALIDATION'   : __EVENTVALIDATION,
            'dlObject': courses.splice(0, 50),
            'lbWeeks': '1-52',
            'lbDays': '1-7;1;2;3;4;5;6;7',
            'dlPeriod': '1-32;1;2;3;4;5;6;7;8;9;10;11;12;13;14;15;16;17;18;19;20;21;22;23;24;25;26;27;28;29;30;31;32;',
            'RadioType': 'module_list;cyon_reports_list_url;dummy',
            'bGetTimetable': 'View Timetable'
        }), {headers: {cookie}})
        $ = cheerio.load(response.data)
        const tables = $('.cyon_table')
        for (let i = 0; i < tables.length; i++) {
            const table = tables.eq(i)
            const courseCode = table.prev().find('a').text()
            data[courseCode] = []
            const rows = table.find('tbody tr')
            for (let j = 0; j < rows.length; j++) {
                let occurrences = []
                const cells = rows.eq(j).find('td')
                const dates = cells.eq(5).children('div').text().split(', ')
                const locationCell = cells.eq(7)
                const locationLinks = locationCell.children('a')
                for (let k = 0; k < locationLinks.length; k++) {
                    const link = locationLinks.eq(k)
                    const regexMatch = link.attr('href').match('show=[0-9]+')
                    if (!regexMatch) continue
                    const locationID = regexMatch[0].split('=')[1]
                    let point
                    const match = campusMap.items.find(item => item.id === locationID)
                    if (!match) {
                        point = knownLocations.get(locationID)
                        if (!point) {
                            response = await axios.get(`https://www.anu.edu.au/anu-campus-map/show/${locationID}`, {httpsAgent})
                            point = response.data.points[Object.keys(response.data.points)[0]]
                            knownLocations.set(locationID, point)
                        }
                    } else {
                        point = match['point']
                    }
                    link.attr('href', `https://www.google.com/maps/dir//${point.latitude},${point.longitude}`)
                }
                for (const date of dates) {
                    const dateArray = date.split(' - ')
                    let startDate = new Date(dateArray[0])
                    const endDate = new Date(dateArray[dateArray.length - 1])
                    while (startDate <= endDate) {
                        occurrences.push({
                            name: cells.eq(0).children('a').first().text().trim(),
                            start: new Date(startDate.toDateString() + ' ' + cells.eq(2).text()).getTime(),
                            end: new Date(endDate.toDateString() + ' ' + cells.eq(3).text()).getTime(),
                            type: cells.eq(6).text(),
                            location: locationCell.html(),
                            notes: cells.eq(8).text()
                        })
                        startDate.setDate(startDate.getDate() + 7)
                    }
                }
                const matchingGroup = data[courseCode].find(group => group[0][0].name.slice(0, group[0][0].name.lastIndexOf('/')) === occurrences[0].name.slice(0, occurrences[0].name.lastIndexOf('/')))
                if (matchingGroup) matchingGroup.push(occurrences)
                else data[courseCode].push([occurrences])
            }
            console.log('Scraped ' + courseCode)
        }
    }
    return data
}

scrape().then(data => {
    fs.writeFileSync('timetable.json', JSON.stringify(data))
    console.log('Wrote ' + Object.keys(data).length + ' courses')
})