<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <div class="d-flex align-center">
        <v-img
          alt="ANU Timetable Logo"
          class="shrink mr-2"
          contain
          :src="require('./assets/logo.png')"
          transition="scale-transition"
          width="40"
        />

        <v-img
          alt="ANU Timetable Name"
          class="shrink mt-1 hidden-sm-and-down"
          contain
          min-width="100"
          :src="require('./assets/name.png')"
          width="200"
        />
      </div>

      <v-spacer></v-spacer>

      <v-autocomplete
          v-model="values"
          :items="options"
          class="mr-2"
          style="max-width: 650px"
          multiple
          chips
          deletable-chips
          flat
          hide-no-data
          hide-details
          solo-inverted
          label="What courses are you taking?"
      >
        <template v-slot:selection="data">
          <v-chip
              :color="colors[values.indexOf(data.item.value)]"
              close
              @click="data.select"
              @click:close="remove(data.item)"
          >
            {{ data.item.value.split('_')[0] }}
          </v-chip>
        </template>
      </v-autocomplete>
      <v-select v-model="select" :items="sessions" style="max-width: 150px" flat hide-details solo-inverted></v-select>
    </v-app-bar>

    <v-main>
      <router-view :values="values"/>
    </v-main>
  </v-app>
</template>

<script>
import timetable from '../scraper/timetable.json';

export default {
  name: 'App',

  data: () => ({
    timetable,
    values: [],
    sessions: [
      { text: 'Semester 1', value: 'S1' },
      { text: 'Semester 2', value: 'S2' },
      { text: 'Summer', value: 'X1' },
      { text: 'Autumn', value: 'X2' },
      { text: 'Winter', value: 'X3' },
      { text: 'Spring', value: 'X4' }
    ],
    select: new Date().getMonth() + 1 >= 6 && new Date().getMonth + 1 <= 10 ? 'S2' : 'S1',
    colors: ['blue lighten-1', 'indigo', 'deep-purple', 'cyan', 'green', 'orange', 'grey darken-1'],
    initialized: false,
  }),

  mounted() {
    if (this.$route.query.s) {
      this.select = this.$route.query.s
    } else if (localStorage.select) {
      this.select = localStorage.select
      this.$router.push({ query: { ...this.$route.query, s: this.select } })
    } else {
      localStorage.select = this.select
      this.$router.push({ query: { ...this.$route.query, s: this.select } })
    }

    if (this.$route.query.c) {
      this.values = this.$route.query.c.split(',').map(c => Object.keys(timetable).find(key => key.startsWith(c)))
    } else if (localStorage.getItem('values')) {
      try {
        this.values = JSON.parse(localStorage.getItem('values'))
      } catch (e) {
        localStorage.removeItem('values')
      }
      this.$router.push({ query: { ...this.$route.query, c: this.values.map(value => value.split('_')[0]).join(',') } }).catch(() => {})
    } else {
      localStorage.setItem('values', JSON.stringify(this.values))
      this.$router.push({ query: { ...this.$route.query, c: this.values.map(value => value.split('_')[0]).join(',') } }).catch(() => {})
    }

    this.$watch('select', newSelect => {
      localStorage.select = newSelect
      this.$router.push({ query: { ...this.$route.query, s: newSelect } }).catch(() => {})
      this.values = []
    })
    this.$watch('values', newValues => {
      localStorage.setItem('values', JSON.stringify(newValues))
      this.$router.push({ query: { ...this.$route.query, c: newValues.map(value => value.split('_')[0]).join(',') } }).catch(() => {})
    })
  },

  computed: {
    options () {
      return Object.keys(timetable).filter(key => new RegExp(`_${this.select}`).test(key)).map(key => ({
        text: key.replace(/_[a-zA-Z0-9]+/, ''),
        value: key
      }))
    }
  },

  methods: {
    remove (item) {
      const index = this.values.indexOf(item.value)
      if (index >= 0) this.values.splice(index, 1)
    }
  }
};
</script>
