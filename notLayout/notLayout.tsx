import type { FC, JSXElementConstructor } from 'react';
import type { match } from 'react-router';

/**
 * 标记一个页面组件不是布局.
 * 当路径精确匹配时, 会展示这个页面组件.
 * 当路径匹配到子路由时, 会直接展示子路由组件.
 *
 * @see https://zh-hans.reactjs.org/docs/higher-order-components.html
 * @see https://umijs.org/zh-CN/docs/routing#routes
 * @see https://umijs.org/zh-CN/docs/routing#%E8%B7%AF%E7%94%B1%E7%BB%84%E4%BB%B6%E5%8F%82%E6%95%B0
 */
const notLayout = <Props extends any>(Page: JSXElementConstructor<Props>) => {
  return (props: { match: match; children: ReturnType<FC> } & Props) => {
    const { match, children } = props;
    return match.isExact ? <Page {...props} /> : children;
  };
};

export default notLayout;
