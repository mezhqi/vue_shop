import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/login.vue'
import Home from './components/home.vue'
import Welcome from './components/welcome.vue'
import User from './components/user/user.vue'
import Rights from './components/power/rights.vue'
import Roles from './components/power/roles.vue'
import Category from './components/goods/category.vue'
import Params from './components/goods/params.vue'
import GoodsList from './components/goods/list.vue'
import AddGoods from './components/goods/add.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: User },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Category },
        { path: '/params', component: Params },
        { path: '/goods', component: GoodsList },
        { path: '/goods/add', component: AddGoods }
      ]
    }
  ]
})
// 全局前置守卫
router.beforeEach((to, from, next) => {
  if (to.path == '/login') {
    return next()
  }
  const token = window.sessionStorage.getItem('token')
  if (!token) {
    return next('/login')
  }
  next()
})

export default router
