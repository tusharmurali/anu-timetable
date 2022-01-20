module.exports = {
    publicPath: process.env.NODE_ENV === 'production'
        ? '/anu-timetable/'
        : '/',

    transpileDependencies: [
      'vuetify'
    ]
}
