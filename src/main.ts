import { createSSRApp } from 'vue';
import App from './App.vue';

export function createApp() {
    const app = createSSRApp(App);
    // Define global properties
    app.config.globalProperties.$log = console.log.bind(console);
    const imgUrl = 'https://cdn.hotpotbuddy.com';
    app.provide('imgUrl', imgUrl);
    return {
        app,
    };
}
