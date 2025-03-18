import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import MarkdownEditor from '../components/MarkdownEditor.vue';

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
    component: MarkdownEditor
  },
  {
    path: '/code-formatter',
    name: 'CodeFormatter',
    component: () => import('../views/CodeFormatter.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router; 