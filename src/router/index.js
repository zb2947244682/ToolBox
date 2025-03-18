import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/markdown-editor',
    name: 'MarkdownEditor',
    component: () => import('../views/MarkdownEditor.vue')
  },
  {
    path: '/js-formatter',
    name: 'JavaScriptFormatter',
    component: () => import('../views/JavaScriptFormatter.vue')
  },
  {
    path: '/html-formatter',
    name: 'HTMLFormatter',
    component: () => import('../views/HTMLFormatter.vue')
  },
  {
    path: '/css-formatter',
    name: 'CSSFormatter',
    component: () => import('../views/CSSFormatter.vue')
  },
  {
    path: '/json-formatter',
    name: 'JSONFormatter',
    component: () => import('../views/JSONFormatter.vue')
  },
  {
    path: '/file-upload',
    name: 'FileUpload',
    component: () => import('../views/FileUpload.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router; 