<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-sheet height="64">
            <v-toolbar
                flat
            >
              <v-btn
                  outlined
                  class="mr-4"
                  color="grey darken-2"
                  @click="focus = ''"
              >
                Today
              </v-btn>
              <v-btn
                  fab
                  text
                  small
                  color="grey darken-2"
                  @click="$refs.calendar.prev()"
              >
                <v-icon small>
                  mdi-chevron-left
                </v-icon>
              </v-btn>
              <v-btn
                  fab
                  text
                  small
                  color="grey darken-2"
                  @click="$refs.calendar.next()"
              >
                <v-icon small>
                  mdi-chevron-right
                </v-icon>
              </v-btn>
              <v-toolbar-title v-if="$refs.calendar">
                {{ $refs.calendar.title }}
              </v-toolbar-title>
              <v-spacer></v-spacer>
              <v-menu
                  bottom
                  right
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                      outlined
                      color="grey darken-2"
                      v-bind="attrs"
                      v-on="on"
                  >
                    <span>{{ typeToLabel[type] }}</span>
                    <v-icon right>
                      mdi-menu-down
                    </v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="type = 'day'">
                    <v-list-item-title>Day</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="type = 'week'">
                    <v-list-item-title>Week</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="type = 'month'">
                    <v-list-item-title>Month</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-toolbar>
          </v-sheet>

          <v-sheet height="600">
            <v-calendar
                ref="calendar"
                v-model="focus"
                color="primary"
                :events="events"
                :event-color="event => event.color"
                :type="type"
                first-time="07:00"
                :interval-minutes="30"
                :interval-count="32"
                @click:event="showEvent"
                @click:more="viewDay"
                @click:date="viewDay"
            >
              <template v-slot:event="{ event }">
                <div class="pl-1" v-if="type === 'month'">
                      <span class="v-event-summary">
                        <strong>{{ formatAMPM(new Date(event.start)) }}</strong> {{ event.name }}
                      </span>
                </div>
                <div class="pl-1" v-else>
                      <span class="v-event-summary">
                        <strong>{{ event.name }}</strong><br><span class="font-weight-medium">{{ event.type }}</span><br>{{ formatAMPM(new Date(event.start)) }} - {{ formatAMPM(new Date(event.end)) }}
                      </span>
                </div>
              </template>
              <template v-slot:day-body="{ date, week, present }">
                <div
                    v-if="present"
                    class="v-current-time"
                    :class="{ first: date === week[0].date }"
                    :style="{ top: nowY }"
                ></div>
              </template>
            </v-calendar>
            <v-menu
                v-model="selectedOpen"
                :close-on-content-click="false"
                :activator="selectedElement"
                offset-x
            >
              <v-card
                  color="grey lighten-4"
                  min-width="350px"
                  flat
              >
                <v-toolbar
                    :color="selectedEvent.color"
                    dark
                >
                  <v-toolbar-title v-if="selectedEvent.name">{{ selectedEvent.name }}</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-btn @click="selectedOpen = false" icon>
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </v-toolbar>
                <v-card-text>
                  {{ selectedEvent.type }}<br>
                  {{ new Date(selectedEvent.start).toDateString() }}<br>
                  {{ formatAMPM(new Date(selectedEvent.start)) }} - {{ formatAMPM(new Date(selectedEvent.end)) }}<br v-if="selectedEvent.location">
                  <span v-html="selectedEvent.location"></span><br v-if="selectedEvent.notes">
                  {{ selectedEvent.notes }}
                </v-card-text>
                <v-card-actions v-if="selectedEvent.name && timetable[selectedEvent.courseTitle].find(group => group[0][0].activityCode === selectedEvent.activityCode).length > 1 && !selected.includes(selectedEvent.activityName)">
                  <v-btn :color="selectedEvent.color" @click="selectActivity(selectedEvent.activityName)" text>Select</v-btn>
                </v-card-actions>
                <v-card-actions v-if="selectedEvent.name && selected.includes(selectedEvent.activityName)">
                  <v-btn :color="selectedEvent.color" @click="deselectActivity(selectedEvent.activityName)" text>Deselect</v-btn>
                </v-card-actions>
              </v-card>
            </v-menu>
          </v-sheet>
        </v-card>
      </v-col>

      <v-col xl="6" md="4" v-for="(activity, index) in activities.filter(a => new Date() <= new Date(a.end))" :key="index">
        <v-card dark class="d-flex flex-column mb-4" height="100%" :color="color = colors[values.indexOf(activity.courseTitle)]">
          <v-card-text class="d-flex flex-column text-center">
            <p class="text-h4 white--text">
              {{ activity.courseCode }}<br>
              <span class="text-h6">{{ activity.type }}</span>
            </p>
            <div class="font-weight-bold">{{ new Date(activity.start).toDateString() }}<br>{{ formatAMPM(new Date(activity.start)) }} - {{ formatAMPM(new Date(activity.end)) }}</div>
            <p class="font-weight-bold" v-html="activity.location"></p>
            <div v-if="timetable[activity.courseTitle].find(group => group[0][0].activityCode === activity.activityCode).length > 1 && !selected.includes(activity.name)">
              <v-btn small :color="color" @click="selectActivity(activity.name)">
                Select
              </v-btn>
            </div>
            <div v-if="selected.includes(activity.name)">
              <v-btn small :color="color" @click="deselectActivity(activity.name)">
                Deselect
              </v-btn>
            </div>
            <div v-if="activity.notes">
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-icon
                      v-on="on"
                      right
                  >
                    mdi-help-circle
                  </v-icon>
                </template>
                <span>{{ activity.notes }}</span>
              </v-tooltip>
            </div>
          </v-card-text>
          <v-spacer></v-spacer>
          <v-divider></v-divider>
          <v-card-actions class="justify-center" :key="update">
            {{ timeTo(new Date(activity.start)) }}
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss">
.v-current-time {
  height: 2px;
  background-color: #ea4335;
  position: absolute;
  left: -1px;
  right: 0;
  pointer-events: none;
  &.first::before {
    content: '';
    position: absolute;
    background-color: #ea4335;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    margin-top: -5px;
    margin-left: -6.5px;
  }
}
p > a {
  color: #FFFFFF !important;
  caret-color: #FFFFFF !important;
}
</style>

<script>
  import timetable from '../../scraper/timetable.json';

  export default {
    name: 'Timetable',

    props: ['values'],

    data: () => ({
      timetable,
      focus: '',
      type: 'week',
      typeToLabel: {
        month: 'Month',
        week: 'Week',
        day: 'Day'
      },
      selected: [],
      selectedEvent: {},
      selectedElement: null,
      selectedOpen: false,
      colors: ['blue lighten-1', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1'],
      ready: false,
      update: false
    }),

    mounted () {
      this.ready = true
      this.scrollToTime()
      this.updateTime()

      if (localStorage.getItem('selected')) {
        try {
          this.selected = JSON.parse(localStorage.getItem('selected'))
        } catch (e) {
          localStorage.removeItem('selected')
        }
      }
    },

    computed: {
      events () {
        let events = []
        this.activities.forEach(occurrence => {
          events.push({
            name: occurrence.courseCode,
            activityName: occurrence.name,
            activityCode: occurrence.activityCode,
            courseTitle: occurrence.courseTitle,
            start: occurrence.start,
            end: occurrence.end,
            type: occurrence.type,
            location: occurrence.location,
            notes: occurrence.notes,
            color: this.colors[this.values.indexOf(occurrence.courseTitle)],
            timed: true
          })
        })
        return events
      },
      activities () {
        let occurrences = []
        this.values.forEach(value => {
          this.timetable[value].forEach(group => {
            const chosen = group.find(activity => this.selected.includes(activity[0].name))
            if (chosen) {
              chosen.forEach(occurrence => {
                occurrences.push(occurrence)
              })
            } else {
              group.forEach(activity => {
                activity.forEach(occurrence => {
                  occurrences.push(occurrence)
                })
              })
            }
          })
        })
        return occurrences.sort((a, b) => a.start - b.start)
      },
      cal () {
        return this.ready ? this.$refs.calendar : null
      },
      nowY () {
        return this.cal ? this.cal.timeToY(this.cal.times.now) + 'px' : '-10px'
      }
    },

    methods: {
      formatAMPM (date) {
        let hours = date.getHours()
        let minutes = date.getMinutes()
        const ampm = hours >= 12 ? 'pm' : 'am'
        hours = hours % 12
        hours = hours ? hours : 12
        minutes = minutes < 10 ? '0' + minutes : minutes
        return hours + ':' + minutes + ' ' + ampm
      },
      timeTo (date) {
        const today = new Date()
        if (today >= date) return "Happening now"
        let delta = Math.abs(date.getTime() - today.getTime()) / 1000
        const weeks = Math.floor(delta / 604800)
        delta -= weeks * 604800
        const days = Math.floor(delta / 86400) % 7
        delta -= days * 86400
        const hours = Math.floor(delta / 3600) % 24
        delta -= hours * 3600
        const minutes = Math.ceil(delta / 60) % 60
        if (weeks !== 0)
          return "in " + weeks + (weeks === 1 ? " week" : " weeks") + (days === 0 ? "" : " " + days + (days === 1 ? " day" : " days"))
        else if (days !== 0)
          return "in " + days + (days === 1 ? " day" : " days") + (hours === 0 ? "" : " " + hours + (hours === 1 ? " hour" : " hours"))
        else if (hours !== 0)
          return "in " + hours + (hours === 1 ? " hour" : " hours") + (minutes === 0 ? "" : " " + minutes + (minutes === 1 ? " minute" : " minutes"))
        else
          return "in " + minutes + (minutes === 1 ? " minute" : " minutes")
      },
      viewDay ({ date }) {
        this.focus = date
        this.type = 'day'
      },
      showEvent ({ nativeEvent, event }) {
        const open = () => {
          this.selectedEvent = event
          this.selectedElement = nativeEvent.target
          requestAnimationFrame(() => requestAnimationFrame(() => this.selectedOpen = true))
        }
        if (this.selectedOpen) {
          this.selectedOpen = false
          requestAnimationFrame(() => requestAnimationFrame(() => open()))
        } else {
          open()
        }
        nativeEvent.stopPropagation()
      },
      selectActivity (name) {
        this.selected.push(name)
        localStorage.setItem('selected', JSON.stringify(this.selected))
      },
      deselectActivity (name) {
        this.selected.splice(this.selected.indexOf(name), 1)
        localStorage.setItem('selected', JSON.stringify(this.selected))
      },
      getCurrentTime () {
        return this.cal ? this.cal.times.now.hour * 60 + this.cal.times.now.minute : 0
      },
      scrollToTime () {
        const time = this.getCurrentTime()
        const first = Math.max(0, time - (time % 30) - 30)

        this.cal.scrollToTime(first)
      },
      updateTime () {
        setInterval(() => this.cal.updateTimes(), 60 * 1000)
        setInterval(() => this.update = !this.update, 60 * 1000)
      },
    }
  }
</script>
