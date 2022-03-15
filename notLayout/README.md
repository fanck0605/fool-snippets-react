# notLayout

这是一个[高阶组件](https://zh-hans.reactjs.org/docs/higher-order-components.html), 主要配合 react-router 使用, 在多级路由配置时, 让本应该变成 layout 的组件作为一个界面展示, 同时**不影响**下面的子路由界面.

## 基本用法

主要在 ant design pro 项目中使用, 因为 ProContainer 可以根据多级路由配置自动生成面包屑. 如果面包屑要自己整的话, 不如把 UserList 和 UserDetails 放在同一级菜单.

```tsx
export default notLayout(UserListPage)
```

```tsx
{
  routes: [
    {
      path: '/users',
      name: 'users',
      component: './UserListPage',
      routes: [
        {
          path: '/users/:userId',
          name: 'details',
          hideInMenu: true,
          component: './UserDatailsPage', // 这层界面不会因为上级设置了 layout 而不显示
        },
        {
          component: './404',
        },
      ],
    }
  ]
}
```
