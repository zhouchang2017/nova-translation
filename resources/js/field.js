Nova.booting((Vue, router) => {
    Vue.component('index-nova-translation', require('./components/IndexField'));
    Vue.component('detail-nova-translation', require('./components/DetailField'));
    Vue.component('form-nova-translation', require('./components/FormField'));
})
