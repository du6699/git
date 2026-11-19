# 护花使者 · 管理后台设计原型（flower-site-v2）

一套为「护花使者 / Flower Guardian」植物养护 App 设计的管理后台网页原型。纯 HTML / CSS / JavaScript，无需构建工具，可直接用浏览器打开。

## 预览方式

直接双击 `index.html`，或在目录下启动静态服务器：

```bash
cd flower-site-v2
python -m http.server 4173
```

然后访问 <http://localhost:4173/>。

> 使用本地服务器时，浏览器地址栏不会出现 `file://` 限制，图表与交互表现更稳定。

## 页面

| 文件 | 页面 | 主要内容 |
| --- | --- | --- |
| `index.html` | 仪表盘 | KPI 卡片、营收/订单趋势图、待办、最近诊断、热销商品、最新订单 |
| `users.html` | 用户管理 | 用户搜索、角色筛选、批量选择、排序、分页、CSV 导出 |
| `plants.html` | 植物百科 | 词条列表、养护难度、标签、审核状态、新建词条弹窗 |
| `diagnosis.html` | AI 诊断 | 诊断记录、置信度进度、风险等级、复核队列、问题分布 |
| `products.html` | 商品管理 | 商品价格、库存进度、销量、上下架状态 |
| `orders.html` | 订单管理 | 状态标签页、订单详情弹窗、配送方式、批量处理 |
| `stats.html` | 数据统计 | 趋势折线图、渠道构成、品类环形图、月度指数、地区表现 |
| `settings.html` | 系统设置 | 站点信息、通知开关、显示偏好、账号安全、系统信息 |
| `login.html` | 登录页 | 品牌介绍与管理员登录表单 |

## 设计说明

- **品牌色**：`#e94b52`（来自项目 `design.md`），搭配植物绿 `#2f9e6b` 与暖米色浅色底。
- **双主题**：右上角可切换浅色 / 深色模式，选择保存在 `localStorage`。
- **响应式**：桌面固定侧边栏；≤1040px 侧边栏变为抽屉；≤720px 顶栏精简、卡片堆叠；≤460px 单列。
- **可访问性**：键盘焦点环、语义化标签、`aria-label`、图表文字替代、`prefers-reduced-motion` 降级、状态不只依靠颜色表达。
- **图标**：全部来自 [Reicon](https://reicon.dev) 1.2.5（MIT），按官方 npm 包的 `icons/*.js` 提取 Outline / Filled SVG path，集中放在 `assets/js/icons.js`。页面通过 `data-icon="Search"` 声明图标，由 `reiconHydrate()` 注入；没有任何 emoji。
  - 修改图标：在 `assets/js/icons.js` 的 `ICONS` 对象里增删对应名称即可。
- **图表**：手写 SVG，折线支持 7 / 30 / 90 天切换，含双轴、网格线、图例与 `<title>` 提示；环形图与柱状图同样为原生 SVG / CSS。
- **表格**：支持搜索、状态标签筛选、列排序、批量选择、CSV 导出、空状态与分页反馈。

## 文件结构

```text
flower-site-v2/
├── assets/
│   ├── css/app.css          # 设计令牌与全部组件样式
│   ├── js/
│   │   ├── icons.js         # Reicon 图标路径与渲染函数（自动生成）
│   │   ├── data.js          # 演示数据
│   │   └── app.js           # 外壳、渲染、交互
│   └── img/logo.svg         # 自绘花叶品牌标识
├── index.html
├── users.html
├── plants.html
├── diagnosis.html
├── products.html
├── orders.html
├── stats.html
├── settings.html
├── login.html
└── README.md
```

## 与后端对接

当前所有数据都在 `assets/js/data.js` 中，字段参考了现有 FastAPI 接口：

- `/api/admin/stats/overview`、`/api/admin/stats/trend`、`/api/admin/stats/products`
- `/api/admin/users`（`search` / `skip` / `limit`）
- `/api/admin/plants`（词条 CRUD）
- `/api/admin/orders`、`/api/admin/products`

对接时把 `FG_DATA` 换成接口返回数据，并在 `data-action="toast"` / `save-settings` 等演示入口替换为 `fetch` 调用即可。认证沿用项目现有方式：`localStorage` 中的 `token` 通过 `Authorization: Bearer <token>` 传递。

## 说明

这是一个前端设计原型：表单、删除、导出、登录、分页等交互均给出视觉与状态反馈，但不会修改真实数据。
