import Vue from 'vue'
import VueRouter from 'vue-router'
import Timetable from '../components/Timetable.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Timetable',
    component: Timetable
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
