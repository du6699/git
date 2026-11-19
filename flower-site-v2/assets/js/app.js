/* 护花使者管理后台 - 交互与渲染层（纯前端演示） */
(function () {
  'use strict';

  var D = window.FG_DATA || {};
  var page = document.body.dataset.page || 'dashboard';

  /* ------------------------------------------------------------------ *
   * 基础工具
   * ------------------------------------------------------------------ */

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function ico(name, opts) {
    opts = opts || {};
    return '<span data-icon="' + esc(name) + '"' +
      (opts.weight ? ' data-icon-weight="' + opts.weight + '"' : '') +
      (opts.size ? ' data-icon-size="' + opts.size + '"' : '') +
      (opts.cls ? ' class="' + esc(opts.cls) + '"' : '') + '></span>';
  }

  function hydrate(root) {
    if (window.reiconHydrate) window.reiconHydrate(root || document);
  }

  function money(n) {
    return '¥' + Number(n).toLocaleString('zh-CN', { minimumFractionDigits: 0 });
  }

  function initials(name) {
    if (/[\u4e00-\u9fa5]/.test(name)) return name.slice(0, 1);
    return name.trim().split(/\s+/).slice(0, 2).map(function (p) { return p.charAt(0).toUpperCase(); }).join('');
  }

  function avatar(name) {
    return '<span class="avatar">' + esc(initials(name)) + '</span>';
  }

  function badge(text, tone) {
    return '<span class="badge ' + (tone || 'neutral') + '">' + esc(text) + '</span>';
  }

  function delta(value) {
    var up = Number(value) >= 0;
    return '<span class="delta ' + (up ? 'up' : 'down') + '">' +
      ico(up ? 'TrendUp' : 'TrendDown') + Math.abs(value).toFixed(1) + '%</span>';
  }

  var STATUS = {
    order: {
      pending: ['待确认', 'warning'], confirmed: ['已确认', 'info'], shipped: ['已发货', 'violet'],
      completed: ['已完成', 'success'], cancelled: ['已取消', 'neutral']
    },
    plant: { published: ['已发布', 'success'], review: ['待审核', 'warning'], draft: ['草稿', 'neutral'] },
    diagnosis: { confirmed: ['已确诊', 'success'], review: ['待复核', 'warning'], ignored: ['已忽略', 'neutral'] },
    product: { on: ['在售', 'success'], off: ['已下架', 'neutral'] },
    user: { active: ['活跃', 'success'], inactive: ['未激活', 'neutral'] }
  };

  function statusBadge(type, key) {
    var item = (STATUS[type] || {})[key] || [key, 'neutral'];
    return badge(item[0], item[1]);
  }

  function roleBadge(role) {
    var tone = role === '管理员' ? 'violet' : (role === '内容编辑' ? 'info' : 'neutral');
    return badge(role, tone);
  }

  function thumb(icon, tone) {
    return '<span class="cell-thumb ' + (tone || '') + '">' + ico(icon || 'Leaf') + '</span>';
  }

  function dots(level) {
    var html = '<span class="dots" role="img" aria-label="养护难度 ' + level + ' / 5">';
    for (var i = 1; i <= 5; i++) html += '<i class="' + (i <= level ? 'on' : '') + '"></i>';
    return html + '</span>';
  }

  function progress(value, max) {
    var pct = Math.min(100, Math.round(value / max * 100));
    var tone = pct < 20 ? 'low' : (pct < 50 ? 'mid' : '');
    return '<span class="progress ' + tone + '"><span style="width:' + pct + '%"></span></span>';
  }

  /* ------------------------------------------------------------------ *
   * 主题与外壳
   * ------------------------------------------------------------------ */

  function initTheme() {
    var saved = localStorage.getItem('fg-theme');
    var theme = saved === 'dark' || saved === 'light' ? saved : 'light';
    document.documentElement.dataset.theme = theme;
    syncThemeIcon();
  }

  function syncThemeIcon() {
    var isDark = document.documentElement.dataset.theme === 'dark';
    document.querySelectorAll('[data-theme-icon]').forEach(function (node) {
      node.dataset.icon = isDark ? 'Sun' : 'Moon';
      node.setAttribute('aria-label', isDark ? '切换到浅色模式' : '切换到深色模式');
      node.dataset.iconHydrated = '';
      hydrate(node.parentNode);
    });
  }

  function toggleTheme() {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('fg-theme', next);
    syncThemeIcon();
    showToast(next === 'dark' ? '已切换到深色模式' : '已切换到浅色模式');
  }

  var NAV = [
    { label: '工作台', items: [
      { key: 'dashboard', label: '仪表盘', icon: 'Grid', href: 'index.html' }
    ] },
    { label: '内容管理', items: [
      { key: 'plants', label: '植物百科', icon: 'Leaf', href: 'plants.html' },
      { key: 'diagnosis', label: 'AI 诊断', icon: 'Stethoscope', href: 'diagnosis.html' },
      { key: 'products', label: '商品管理', icon: 'ShoppingBag', href: 'products.html' }
    ] },
    { label: '业务管理', items: [
      { key: 'orders', label: '订单管理', icon: 'Receipt', href: 'orders.html', badge: '12' },
      { key: 'users', label: '用户管理', icon: 'Users', href: 'users.html' }
    ] },
    { label: '分析与系统', items: [
      { key: 'stats', label: '数据统计', icon: 'ChartLine', href: 'stats.html' },
      { key: 'settings', label: '系统设置', icon: 'Settings', href: 'settings.html' }
    ] }
  ];

  var META = {
    dashboard: ['仪表盘', '工作台'],
    plants: ['植物百科', '内容管理'],
    diagnosis: ['AI 诊断', '内容管理'],
    products: ['商品管理', '内容管理'],
    orders: ['订单管理', '业务管理'],
    users: ['用户管理', '业务管理'],
    stats: ['数据统计', '分析与系统'],
    settings: ['系统设置', '分析与系统']
  };

  function navHtml() {
    return NAV.map(function (group) {
      return '<div class="nav-group"><div class="nav-group-label">' + esc(group.label) + '</div>' +
        group.items.map(function (item) {
          return '<a class="nav-link' + (item.key === page ? ' active' : '') + '" href="' + item.href + '">' +
            ico(item.icon, { cls: 'nav-icon' }) + '<span>' + esc(item.label) + '</span>' +
            (item.badge ? '<span class="nav-count">' + item.badge + '</span>' : '') + '</a>';
        }).join('') + '</div>';
    }).join('');
  }

  function buildShell() {
    var meta = META[page] || ['仪表盘', '工作台'];
    var sidebar = document.getElementById('sidebar');
    var topbar = document.getElementById('topbar');
    if (sidebar) {
      sidebar.innerHTML =
        '<div class="sidebar-head">' +
          '<span class="brand-mark"><img src="assets/img/logo.svg" alt="护花使者标识"></span>' +
          '<div><div class="brand-name">护花使者</div><div class="brand-caption">Admin Console</div></div>' +
          '<button class="icon-btn sidebar-close" type="button" data-action="close-sidebar" aria-label="关闭导航">' + ico('CloseCircle') + '</button>' +
        '</div>' +
        '<nav class="nav" aria-label="后台主导航">' + navHtml() + '</nav>' +
        '<div class="sidebar-foot">' +
          '<div class="status-card"><span class="status-dot"></span><div>' +
            '<div class="status-title">服务运行正常</div><div class="status-sub">所有接口响应正常</div>' +
          '</div></div>' +
          '<div class="profile-mini">' + avatar('何思远') +
            '<div><div class="profile-name">何思远</div><div class="profile-role">超级管理员</div></div>' +
            '<button class="icon-btn" type="button" data-action="logout" aria-label="退出登录" title="退出登录">' + ico('Logout') + '</button>' +
          '</div>' +
        '</div>';
    }
    if (topbar) {
      topbar.innerHTML =
        '<div class="topbar-left">' +
          '<button class="icon-btn menu-btn" type="button" data-action="open-sidebar" aria-label="打开导航">' + ico('Menu') + '</button>' +
          '<div class="breadcrumb"><span>护花使者</span><span class="sep">/</span><span>' + esc(meta[1]) + '</span><span class="sep">/</span><b>' + esc(meta[0]) + '</b></div>' +
        '</div>' +
        '<div class="search-box">' + ico('Search') +
          '<input id="globalSearch" type="search" placeholder="搜索页面与功能" aria-label="搜索页面与功能" autocomplete="off">' +
          '<span class="search-hint">Ctrl K</span>' +
        '</div>' +
        '<div class="topbar-right">' +
          '<button class="icon-btn" type="button" data-action="theme" aria-label="切换主题" title="切换主题"><span data-theme-icon data-icon="Moon" data-icon-size="18"></span></button>' +
          '<button class="icon-btn" type="button" data-action="notifications" aria-label="查看通知" title="查看通知">' + ico('Notification', { size: '18' }) + '<span class="badge-dot"></span></button>' +
          '<span class="topbar-divider"></span>' +
          '<a class="topbar-user" href="settings.html">' + avatar('何思远') +
            '<span class="user-meta"><span class="name">何思远</span><span class="role">超级管理员</span></span>' +
            ico('ChevronDown', { size: '14' }) +
          '</a>' +
        '</div>';
    }
    document.body.insertAdjacentHTML('beforeend', '<div class="scrim" data-action="close-sidebar"></div>');
  }

  function buildGlobalOverlays() {
    document.body.insertAdjacentHTML('beforeend',
      '<div class="toast-stack" id="toastStack" aria-live="polite"></div>' +
      '<div class="command" id="commandPalette" role="dialog" aria-modal="true" aria-label="快速导航">' +
        '<div class="command-panel">' +
          '<div class="command-input-wrap">' + ico('Search') +
            '<input id="commandInput" type="text" placeholder="输入页面名称快速跳转…" autocomplete="off" aria-label="输入页面名称">' +
            '<span class="search-hint">ESC</span>' +
          '</div>' +
          '<div class="command-list" id="commandList"></div>' +
        '</div>' +
      '</div>' +
      '<div class="overlay" id="notifModal" role="dialog" aria-modal="true" aria-labelledby="notifTitle">' +
        '<div class="modal">' +
          '<div class="modal-head">' + ico('Notification') + '<h3 id="notifTitle">通知中心</h3>' +
            '<button class="icon-btn" type="button" data-action="close-modal" aria-label="关闭">' + ico('CloseCircle') + '</button></div>' +
          '<div class="modal-body"><div class="mini-list">' +
            '<a class="todo-item" href="orders.html"><span class="todo-icon">' + ico('Receipt') + '</span><span class="todo-body"><span class="todo-title">12 笔订单待确认</span><span class="todo-meta">最早一笔已等待 42 分钟</span></span></a>' +
            '<a class="todo-item" href="plants.html"><span class="todo-icon green">' + ico('Leaf') + '</span><span class="todo-body"><span class="todo-title">5 条植物词条待审核</span><span class="todo-meta">由内容编辑提交</span></span></a>' +
            '<a class="todo-item" href="diagnosis.html"><span class="todo-icon amber">' + ico('AlertTriangle') + '</span><span class="todo-body"><span class="todo-title">3 条诊断需要人工复核</span><span class="todo-meta">AI 置信度低于 60%</span></span></a>' +
          '</div></div>' +
          '<div class="modal-foot"><button class="btn btn-primary" type="button" data-action="close-modal">知道了</button></div>' +
        '</div>' +
      '</div>');
  }

  function showToast(message, type) {
    var stack = document.getElementById('toastStack');
    if (!stack) return;
    var node = document.createElement('div');
    node.className = 'toast' + (type === 'error' ? ' error' : '');
    node.innerHTML = ico(type === 'error' ? 'AlertTriangle' : 'CheckCircle') + '<span>' + esc(message) + '</span>';
    stack.appendChild(node);
    hydrate(node);
    requestAnimationFrame(function () { node.classList.add('show'); });
    setTimeout(function () {
      node.classList.remove('show');
      setTimeout(function () { node.remove(); }, 250);
    }, 2800);
  }

  function openModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('show');
    document.body.classList.add('no-scroll');
    var focusable = modal.querySelector('input, button');
    if (focusable) focusable.focus();
  }

  function closeModals() {
    document.querySelectorAll('.overlay.show').forEach(function (node) { node.classList.remove('show'); });
    if (!document.querySelector('.command.show')) document.body.classList.remove('no-scroll');
  }

  function openCommand() {
    var palette = document.getElementById('commandPalette');
    if (!palette) return;
    palette.classList.add('show');
    document.body.classList.add('no-scroll');
    renderCommand('');
    var input = document.getElementById('commandInput');
    if (input) { input.value = ''; input.focus(); }
  }

  function closeCommand() {
    var palette = document.getElementById('commandPalette');
    if (palette) palette.classList.remove('show');
    if (!document.querySelector('.overlay.show')) document.body.classList.remove('no-scroll');
  }

  function renderCommand(query) {
    var list = document.getElementById('commandList');
    if (!list) return;
    var all = [];
    NAV.forEach(function (group) {
      group.items.forEach(function (item) {
        all.push({ label: item.label, icon: item.icon, href: item.href, group: group.label, key: item.key });
      });
    });
    var q = (query || '').trim().toLowerCase();
    var matched = all.filter(function (item) {
      return !q || item.label.toLowerCase().indexOf(q) >= 0 || item.group.toLowerCase().indexOf(q) >= 0;
    });
    if (!matched.length) {
      list.innerHTML = '<div class="command-empty">没有匹配的页面</div>';
      return;
    }
    list.innerHTML = matched.map(function (item) {
      return '<a class="command-item" href="' + item.href + '">' + ico(item.icon) +
        '<span>' + esc(item.label) + '</span><small>' + esc(item.group) + '</small></a>';
    }).join('');
    hydrate(list);
  }

  /* ------------------------------------------------------------------ *
   * 图表
   * ------------------------------------------------------------------ */

  function svgPath(values, xAt, yAt) {
    return values.map(function (v, i) {
      return (i ? 'L' : 'M') + xAt(i).toFixed(1) + ' ' + yAt(v).toFixed(1);
    }).join(' ');
  }

  function renderTrend(period) {
    var wrap = document.getElementById('trendChart');
    if (!wrap) return;
    var data = D.trend && D.trend[period] ? D.trend[period] : (D.trend && D.trend['7']);
    if (!data) return;

    var W = 760, H = 268, L = 52, R = 52, T = 18, B = 34;
    var iw = W - L - R, ih = H - T - B;
    var maxSales = Math.max.apply(null, data.sales);
    var maxOrders = Math.max.apply(null, data.orders);
    var salesTop = Math.ceil(maxSales * 1.12 / 1000) * 1000;
    var ordersTop = Math.ceil(maxOrders * 1.25 / 10) * 10;
    var xAt = function (i) { return L + (data.labels.length === 1 ? 0 : i * iw / (data.labels.length - 1)); };
    var ySales = function (v) { return T + ih - v / salesTop * ih; };
    var yOrders = function (v) { return T + ih - v / ordersTop * ih; };

    var grid = '', leftLabels = '', rightLabels = '', xLabels = '';
    for (var g = 0; g <= 4; g++) {
      var y = T + g * ih / 4;
      grid += '<line class="grid-line" x1="' + L + '" y1="' + y.toFixed(1) + '" x2="' + (W - R) + '" y2="' + y.toFixed(1) + '"/>';
      var salesTick = (salesTop * (1 - g / 4) / 1000).toFixed(1).replace(/\.0$/, '');
      leftLabels += '<text class="axis-text" x="' + (L - 10) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">' +
        salesTick + 'k</text>';
      rightLabels += '<text class="axis-text" x="' + (W - R + 10) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="start">' +
        Math.round(ordersTop * (1 - g / 4)) + '</text>';
    }
    var step = Math.max(1, Math.ceil(data.labels.length / 7));
    data.labels.forEach(function (label, i) {
      if (i % step !== 0 && i !== data.labels.length - 1) return;
      xLabels += '<text class="axis-text" x="' + xAt(i).toFixed(1) + '" y="' + (H - 10) + '" text-anchor="middle">' + esc(label) + '</text>';
    });

    var salesLine = svgPath(data.sales, xAt, ySales);
    var areaPath = salesLine + ' L' + xAt(data.sales.length - 1).toFixed(1) + ' ' + (T + ih) + ' L' + L + ' ' + (T + ih) + ' Z';
    var points = data.sales.map(function (v, i) {
      var show = data.labels.length <= 7 || i % Math.ceil(data.labels.length / 8) === 0;
      return show ? '<g class="chart-point"><circle cx="' + xAt(i).toFixed(1) + '" cy="' + ySales(v).toFixed(1) + '" r="3.5" fill="var(--surface)" stroke="var(--brand)" stroke-width="2"><title>' +
        esc(data.labels[i]) + ' 营收 ¥' + Number(v).toLocaleString('zh-CN') + ' · 订单 ' + data.orders[i] + '</title></circle></g>' : '';
    }).join('');

    wrap.innerHTML =
      '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="营收与订单趋势折线图">' +
        '<defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="var(--brand)" stop-opacity="0.22"/>' +
          '<stop offset="100%" stop-color="var(--brand)" stop-opacity="0"/>' +
        '</linearGradient></defs>' +
        grid + leftLabels + rightLabels + xLabels +
        '<path d="' + areaPath + '" fill="url(#salesFill)"/>' +
        '<path d="' + svgPath(data.orders, xAt, yOrders) + '" fill="none" stroke="var(--green)" stroke-width="2" stroke-dasharray="6 5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="' + salesLine + '" fill="none" stroke="var(--brand)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        points +
      '</svg>';
  }

  function donutSegments(items) {
    var total = items.reduce(function (sum, item) { return sum + item.value; }, 0);
    var r = 58, c = 2 * Math.PI * r;
    var offset = 0;
    return items.map(function (item) {
      var len = c * item.value / total;
      var seg = '<circle cx="80" cy="80" r="' + r + '" fill="none" stroke="' + item.color +
        '" stroke-width="19" stroke-dasharray="' + (len - 2).toFixed(2) + ' ' + (c - len + 2).toFixed(2) +
        '" stroke-dashoffset="' + (-offset).toFixed(2) + '"><title>' + esc(item.label) + ' ' + item.value + '%</title></circle>';
      offset += len;
      return seg;
    }).join('');
  }

  /* ------------------------------------------------------------------ *
   * 页面数据渲染
   * ------------------------------------------------------------------ */

  var RENDERERS = {
    kpis: function () {
      return D.kpis.map(function (k) {
        return '<article class="card kpi-card ' + k.tone + '">' +
          '<div class="kpi-top"><span class="kpi-icon">' + ico(k.icon) + '</span><span class="kpi-label">' + esc(k.label) + '</span></div>' +
          '<div class="kpi-value">' + esc(k.value) + '</div>' +
          '<div class="kpi-meta">' + delta(k.delta) + '<span class="kpi-note">' + esc(k.note) + '</span></div>' +
        '</article>';
      }).join('');
    },

    todos: function () {
      return D.todos.map(function (t) {
        return '<a class="todo-item" href="' + t.target + '">' +
          '<span class="todo-icon ' + t.tone + '">' + ico(t.icon) + '</span>' +
          '<span class="todo-body"><span class="todo-title">' + esc(t.title) + '</span><span class="todo-meta">' + esc(t.meta) + '</span></span>' +
          '<span class="todo-count">' + t.count + '</span><span class="todo-arrow">' + ico('ChevronRight', { size: '15' }) + '</span></a>';
      }).join('');
    },

    recentDiagnoses: function () {
      return D.recentDiagnoses.map(function (item) {
        return '<div class="mini-row"><span class="mini-thumb">' + ico('Stethoscope') + '</span>' +
          '<span class="mini-main"><span class="mini-title">' + esc(item.name) + '</span><span class="mini-sub">' + esc(item.meta) + '</span></span>' +
          '<span class="mini-value">' + esc(item.value) + '</span></div>';
      }).join('');
    },

    topProducts: function () {
      return D.topProducts.map(function (p, i) {
        return '<tr><td><span class="cell">' + thumb(i === 0 ? 'Sparkles' : 'Leaf', i === 0 ? '' : 'green') +
          '<span class="main"><span class="main-title">' + esc(p.name) + '</span><span class="main-sub">' + esc(p.sku) + '</span></span></span></td>' +
          '<td class="num">' + p.sold + '</td><td class="num strong">' + esc(p.revenue) + '</td>' +
          '<td>' + delta(p.trend) + '</td></tr>';
      }).join('');
    },

    latestOrders: function () {
      return D.latestOrders.map(function (o) {
        return '<tr><td class="strong num">' + esc(o.no) + '</td><td>' + esc(o.customer) + '</td>' +
          '<td class="num">' + esc(o.amount) + '</td><td>' + statusBadge('order', o.status) + '</td>' +
          '<td class="num">' + esc(o.time) + '</td></tr>';
      }).join('');
    },

    usersBody: function () {
      return D.users.map(function (u) {
        var searchText = (u.name + ' ' + u.email + ' ' + u.phone + ' ' + u.role).toLowerCase();
        return '<tr data-filter-val="' + esc(u.role) + '" data-search-text="' + esc(searchText) + '">' +
          '<td><input type="checkbox" class="row-check" aria-label="选择用户 ' + esc(u.name) + '"></td>' +
          '<td><span class="cell">' + avatar(u.name) + '<span class="main"><span class="main-title">' + esc(u.name) +
            '</span><span class="main-sub">' + esc(u.email) + '</span></span></span></td>' +
          '<td class="num">' + esc(u.phone) + '</td>' +
          '<td>' + roleBadge(u.role) + '</td>' +
          '<td class="num">' + u.plants + '</td><td class="num">' + u.orders + '</td>' +
          '<td>' + statusBadge('user', u.status) + '</td>' +
          '<td class="num">' + esc(u.joined) + '</td>' +
          '<td><span class="row-actions"><button class="link-btn" type="button" data-action="toast" data-toast="已打开 ' + esc(u.name) + ' 的详情（演示）">查看</button>' +
            '<button class="link-btn danger" type="button" data-action="toast" data-toast="已停用 ' + esc(u.name) + '（演示）">停用</button></span></td></tr>';
      }).join('');
    },

    plantsBody: function () {
      return D.plants.map(function (p) {
        var searchText = (p.name + ' ' + p.scientific + ' ' + p.category + ' ' + p.tags.join(' ')).toLowerCase();
        return '<tr data-filter-val="' + p.status + '" data-search-text="' + esc(searchText) + '">' +
          '<td><input type="checkbox" class="row-check" aria-label="选择植物 ' + esc(p.name) + '"></td>' +
          '<td><span class="cell">' + thumb(p.icon, p.tone) + '<span class="main"><span class="main-title">' + esc(p.name) +
            '</span><span class="main-sub">' + esc(p.scientific) + '</span></span></span></td>' +
          '<td>' + esc(p.category) + '</td>' +
          '<td>' + dots(p.care) + '<span class="main-sub" style="margin-top:4px">' + p.care + ' / 5</span></td>' +
          '<td>' + p.tags.map(function (t) { return badge(t, 'info'); }).join(' ') + '</td>' +
          '<td class="num">' + Number(p.views).toLocaleString('zh-CN') + '</td>' +
          '<td>' + statusBadge('plant', p.status) + '</td>' +
          '<td class="num">' + esc(p.updated) + '</td>' +
          '<td><span class="row-actions"><button class="link-btn" type="button" data-action="toast" data-toast="正在编辑「' + esc(p.name) + '」（演示）">编辑</button>' +
            '<button class="link-btn danger" type="button" data-action="toast" data-toast="已删除「' + esc(p.name) + '」（演示）">删除</button></span></td></tr>';
      }).join('');
    },

    diagnosisBody: function () {
      return D.diagnoses.map(function (d) {
        var searchText = (d.plant + ' ' + d.symptom + ' ' + d.result).toLowerCase();
        var confTone = d.confidence >= 80 ? '' : (d.confidence >= 60 ? 'mid' : 'low');
        return '<tr data-filter-val="' + d.status + '" data-search-text="' + esc(searchText) + '">' +
          '<td><input type="checkbox" class="row-check" aria-label="选择诊断 ' + esc(d.plant) + '"></td>' +
          '<td><span class="cell">' + thumb('Scan', 'blue') + '<span class="main"><span class="main-title">' + esc(d.plant) +
            '</span><span class="main-sub">' + esc(d.symptom) + '</span></span></span></td>' +
          '<td>' + esc(d.result) + '</td>' +
          '<td><span class="progress-cell"><span class="progress ' + confTone + '"><span style="width:' + d.confidence + '%"></span></span><small>' + d.confidence + '%</small></span></td>' +
          '<td>' + esc(d.source) + '</td>' +
          '<td>' + (d.severity === '高' ? badge('高风险', 'danger') : (d.severity === '中' ? badge('中风险', 'warning') : badge('低风险', 'success'))) + '</td>' +
          '<td>' + statusBadge('diagnosis', d.status) + '</td>' +
          '<td class="num">' + esc(d.time) + '</td>' +
          '<td><span class="row-actions"><button class="link-btn" type="button" data-action="toast" data-toast="已打开诊断详情（演示）">详情</button>' +
            '<button class="link-btn" type="button" data-action="toast" data-toast="已标记复核完成（演示）">复核</button></span></td></tr>';
      }).join('');
    },

    diagnosisDistribution: function () {
      return D.diagnosisDistribution.map(function (item) {
        return '<div class="breakdown-row"><span class="breakdown-label">' + esc(item.label) + '</span>' +
          '<span class="breakdown-value">' + item.pct + '%</span>' +
          '<span class="breakdown-track"><span class="breakdown-fill ' + item.tone + '" style="width:' + item.pct + '%"></span></span></div>';
      }).join('');
    },

    productsBody: function () {
      return D.products.map(function (p) {
        var searchText = (p.name + ' ' + p.sku + ' ' + p.category).toLowerCase();
        return '<tr data-filter-val="' + p.status + '" data-search-text="' + esc(searchText) + '">' +
          '<td><input type="checkbox" class="row-check" aria-label="选择商品 ' + esc(p.name) + '"></td>' +
          '<td><span class="cell">' + thumb(p.icon, p.tone) + '<span class="main"><span class="main-title">' + esc(p.name) +
            '</span><span class="main-sub">' + esc(p.sku) + '</span></span></span></td>' +
          '<td>' + esc(p.category) + '</td>' +
          '<td class="num strong">' + money(p.price) + '</td>' +
          '<td><span class="progress-cell">' + progress(p.stock, 500) + '<small>' + p.stock + '</small></span></td>' +
          '<td class="num">' + p.sold + '</td>' +
          '<td>' + statusBadge('product', p.status) + '</td>' +
          '<td><span class="row-actions"><button class="link-btn" type="button" data-action="toast" data-toast="正在编辑「' + esc(p.name) + '」（演示）">编辑</button>' +
            '<button class="link-btn danger" type="button" data-action="toast" data-toast="已下架「' + esc(p.name) + '」（演示）">下架</button></span></td></tr>';
      }).join('');
    },

    ordersBody: function () {
      return D.orders.map(function (o) {
        var searchText = (o.no + ' ' + o.customer + ' ' + o.items + ' ' + o.phone).toLowerCase();
        return '<tr data-filter-val="' + o.status + '" data-search-text="' + esc(searchText) + '">' +
          '<td><input type="checkbox" class="row-check" aria-label="选择订单 ' + esc(o.no) + '"></td>' +
          '<td class="num strong">' + esc(o.no) + '</td>' +
          '<td><span class="cell">' + avatar(o.customer) + '<span class="main"><span class="main-title">' + esc(o.customer) +
            '</span><span class="main-sub">' + esc(o.phone) + '</span></span></span></td>' +
          '<td><span class="main-sub" style="white-space:normal">' + esc(o.items) + '</span></td>' +
          '<td class="num strong">' + money(o.amount) + '</td>' +
          '<td>' + esc(o.delivery) + '</td>' +
          '<td>' + statusBadge('order', o.status) + '</td>' +
          '<td class="num">' + esc(o.time) + '</td>' +
          '<td><span class="row-actions"><button class="link-btn" type="button" data-action="order-detail" data-order="' + esc(o.no) + '">详情</button>' +
            '<button class="link-btn" type="button" data-action="toast" data-toast="已开始处理订单 ' + esc(o.no) + '（演示）">处理</button></span></td></tr>';
      }).join('');
    },

    channels: function () {
      return D.channels.map(function (c) {
        return '<div class="breakdown-row"><span class="breakdown-label">' + esc(c.label) + '</span>' +
          '<span class="breakdown-value">' + money(c.value) + ' · ' + c.pct + '%</span>' +
          '<span class="breakdown-track"><span class="breakdown-fill ' + c.tone + '" style="width:' + c.pct + '%"></span></span></div>';
      }).join('');
    },

    categoryDonut: function () {
      return '<div class="donut-wrap"><svg class="donut" viewBox="0 0 160 160" role="img" aria-label="商品品类销售占比环形图">' +
        '<circle cx="80" cy="80" r="58" fill="none" stroke="var(--surface-3)" stroke-width="19"/>' +
        '<g transform="rotate(-90 80 80)">' + donutSegments(D.categories) + '</g>' +
        '<text class="donut-center" x="80" y="78" text-anchor="middle">100%</text>' +
        '<text class="donut-center-label" x="80" y="96" text-anchor="middle">销售构成</text></svg>' +
        '<div class="donut-legend">' + D.categories.map(function (c) {
          return '<div class="donut-legend-item"><span class="swatch" style="background:' + c.color + '"></span>' +
            '<span>' + esc(c.label) + '</span><span class="pct">' + c.value + '%</span></div>';
        }).join('') + '</div></div>';
    },

    regionsBody: function () {
      return D.regions.map(function (r) {
        return '<tr><td class="strong">' + esc(r.name) + '</td><td class="num">' + Number(r.users).toLocaleString('zh-CN') + '</td>' +
          '<td class="num">' + r.orders + '</td><td class="num strong">' + esc(r.amount) + '</td></tr>';
      }).join('');
    },

    monthlyBars: function () {
      return D.monthlyBars.map(function (b) {
        return '<div class="bar-col"><div class="bar-track"><div class="bar-fill" style="height:' + b.value + '%" title="' + esc(b.label) + ' 指数 ' + b.value + '"></div></div>' +
          '<span class="bar-label">' + esc(b.label) + '</span></div>';
      }).join('');
    }
  };

  function renderAll() {
    document.querySelectorAll('[data-render]').forEach(function (node) {
      var fn = RENDERERS[node.dataset.render];
      if (fn) node.innerHTML = fn();
    });
    hydrate();
  }

  /* ------------------------------------------------------------------ *
   * 表格交互
   * ------------------------------------------------------------------ */

  function tableRows(root) {
    return Array.prototype.slice.call(root.querySelectorAll('tbody tr[data-search-text]'));
  }

  function applyFilters(card) {
    if (!card) return;
    var query = (card.querySelector('[data-table-search]') || {}).value || '';
    query = query.trim().toLowerCase();
    var activeChip = card.querySelector('.chip.active[data-filter-val]');
    var filterVal = activeChip ? activeChip.dataset.filterVal : 'all';
    var visible = 0;
    tableRows(card).forEach(function (row) {
      var matchSearch = !query || (row.dataset.searchText || '').indexOf(query) >= 0;
      var matchFilter = filterVal === 'all' || row.dataset.filterVal === filterVal;
      var show = matchSearch && matchFilter;
      row.hidden = !show;
      if (show) visible++;
    });
    var empty = card.querySelector('[data-empty]');
    if (empty) empty.hidden = visible !== 0;
    var count = card.querySelector('[data-visible-count]');
    if (count) count.textContent = visible;
    updateBulk(card);
  }

  function updateBulk(card) {
    if (!card) return;
    var checks = Array.prototype.slice.call(card.querySelectorAll('.row-check'));
    var checked = checks.filter(function (c) { return c.checked; }).length;
    var bar = card.querySelector('.bulk-bar');
    var label = card.querySelector('[data-bulk-count]');
    if (bar) bar.classList.toggle('show', checked > 0);
    if (label) label.textContent = checked;
    var selectAll = card.querySelector('[data-select-all]');
    if (selectAll) selectAll.checked = checked > 0 && checked === checks.length;
  }

  function sortTable(th) {
    var table = th.closest('table');
    var tbody = table && table.querySelector('tbody');
    if (!tbody) return;
    var index = Array.prototype.indexOf.call(th.parentNode.children, th);
    var key = th.dataset.sort || '';
    var asc = th.dataset.sortDir !== 'asc';
    table.querySelectorAll('th').forEach(function (h) { h.dataset.sortDir = ''; });
    th.dataset.sortDir = asc ? 'asc' : 'desc';
    var ind = th.querySelector('.sort-ind [data-icon]');
    if (ind) ind.dataset.icon = asc ? 'ChevronUp' : 'ChevronDown';
    var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
    rows.sort(function (a, b) {
      var av = (a.children[index] && a.children[index].textContent || '').trim();
      var bv = (b.children[index] && b.children[index].textContent || '').trim();
      var an = parseFloat(av.replace(/[¥,%\s]/g, ''));
      var bn = parseFloat(bv.replace(/[¥,%\s]/g, ''));
      if (!isNaN(an) && !isNaN(bn)) return asc ? an - bn : bn - an;
      return asc ? av.localeCompare(bv, 'zh-CN') : bv.localeCompare(av, 'zh-CN');
    });
    rows.forEach(function (row) { tbody.appendChild(row); });
    hydrate(th);
  }

  function exportTable(card) {
    var table = card && card.querySelector('table');
    if (!table) return;
    var lines = [];
    table.querySelectorAll('tr').forEach(function (tr) {
      if (tr.hidden) return;
      var cols = Array.prototype.slice.call(tr.children).filter(function (td) { return td.querySelector('input[type="checkbox"]') ? false : true; });
      var cells = cols.map(function (td) {
        return '"' + td.textContent.replace(/\s+/g, ' ').trim().replace(/"/g, '""') + '"';
      });
      if (cells.length) lines.push(cells.join(','));
    });
    var blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'flower-guardian-' + page + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(link.href); }, 1000);
    showToast('已导出当前表格数据');
  }

  /* ------------------------------------------------------------------ *
   * 事件委托
   * ------------------------------------------------------------------ */

  function bindEvents() {
    document.addEventListener('click', function (e) {
      var target = e.target.closest('[data-action], .chip, th.sortable, .page-btn, .chart-tabs button');
      if (!target) return;

      if (target.matches('.chart-tabs button')) {
        document.querySelectorAll('.chart-tabs button').forEach(function (b) { b.classList.remove('active'); });
        target.classList.add('active');
        renderTrend(target.dataset.period);
        return;
      }
      if (target.matches('th.sortable')) { sortTable(target); return; }

      if (target.matches('.chip')) {
        var card = target.closest('.card');
        card.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
        target.classList.add('active');
        applyFilters(card);
        return;
      }
      if (target.matches('.page-btn')) {
        document.querySelectorAll('.page-btn').forEach(function (b) { b.classList.remove('active'); });
        if (target.dataset.pageIndex) {
          target.classList.add('active');
          showToast('已切换到第 ' + target.dataset.pageIndex + ' 页（演示数据）');
        }
        return;
      }

      var action = target.dataset.action;
      if (!action) return;
      switch (action) {
        case 'theme': toggleTheme(); break;
        case 'open-sidebar': document.body.classList.add('sidebar-open'); document.querySelector('.scrim').classList.add('show'); break;
        case 'close-sidebar': document.body.classList.remove('sidebar-open'); document.querySelector('.scrim').classList.remove('show'); break;
        case 'notifications': openModal('notifModal'); break;
        case 'close-modal': closeModals(); break;
        case 'toast': showToast(target.dataset.toast); break;
        case 'export': exportTable(target.closest('.card')); break;
        case 'modal': openModal(target.dataset.modal); break;
        case 'reset-filter': {
          var resetCard = target.closest('.card');
          var search = resetCard.querySelector('[data-table-search]');
          if (search) search.value = '';
          resetCard.querySelectorAll('.chip').forEach(function (c, i) { c.classList.toggle('active', i === 0); });
          applyFilters(resetCard);
          showToast('筛选条件已重置');
          break;
        }
        case 'order-detail': {
          var no = target.dataset.order;
          var order = (D.orders || []).filter(function (o) { return o.no === no; })[0];
          if (!order) break;
          var box = document.getElementById('orderDetailBody');
          if (box) {
            box.innerHTML =
              '<div class="form-grid">' +
                '<div class="form-group"><span class="form-label">订单编号</span><span class="form-control" style="background:var(--surface-2)">' + esc(order.no) + '</span></div>' +
                '<div class="form-group"><span class="form-label">当前状态</span><span>' + statusBadge('order', order.status) + '</span></div>' +
                '<div class="form-group"><span class="form-label">客户</span><span class="form-control" style="background:var(--surface-2)">' + esc(order.customer) + ' · ' + esc(order.phone) + '</span></div>' +
                '<div class="form-group"><span class="form-label">配送方式</span><span class="form-control" style="background:var(--surface-2)">' + esc(order.delivery) + '</span></div>' +
                '<div class="form-group full"><span class="form-label">商品</span><span class="form-control" style="background:var(--surface-2)">' + esc(order.items) + '</span></div>' +
                '<div class="form-group"><span class="form-label">订单金额</span><span class="form-control" style="background:var(--surface-2)">' + money(order.amount) + '</span></div>' +
                '<div class="form-group"><span class="form-label">下单时间</span><span class="form-control" style="background:var(--surface-2)">' + esc(order.time) + '</span></div>' +
              '</div>';
          }
          openModal('orderModal');
          break;
        }
        case 'logout':
          localStorage.removeItem('fg-auth');
          showToast('已退出登录（演示）');
          setTimeout(function () { location.href = 'login.html'; }, 500);
          break;
        case 'save-settings': showToast('设置已保存（演示数据）'); break;
        case 'save-and-close': showToast('更改已保存（演示数据）'); closeModals(); break;
      }
    });

    document.addEventListener('input', function (e) {
      var el = e.target;
      if (el.matches('[data-table-search]')) applyFilters(el.closest('.card'));
      if (el.id === 'commandInput') renderCommand(el.value);
    });

    document.addEventListener('change', function (e) {
      if (e.target.matches('[data-select-all]')) {
        var card = e.target.closest('.card');
        card.querySelectorAll('.row-check').forEach(function (c) { c.checked = e.target.checked; });
        updateBulk(card);
      }
      if (e.target.matches('.row-check')) updateBulk(e.target.closest('.card'));
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.overlay')) return;
      if (e.target.classList.contains('overlay')) closeModals();
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.command')) return;
      if (e.target.classList.contains('command')) closeCommand();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeModals(); closeCommand(); document.body.classList.remove('sidebar-open'); document.querySelector('.scrim').classList.remove('show'); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openCommand(); return; }
      if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); openCommand(); }
      if (e.key === 'Enter' && document.getElementById('commandPalette').classList.contains('show')) {
        var first = document.querySelector('#commandList .command-item');
        if (first) location.href = first.getAttribute('href');
      }
    });

    document.addEventListener('submit', function (e) {
      if (!e.target.matches('#loginForm')) return;
      e.preventDefault();
      var username = document.getElementById('loginUser');
      var password = document.getElementById('loginPass');
      var error = document.getElementById('loginError');
      if (!username.value.trim() || !password.value.trim()) {
        error.textContent = '请输入账号和密码';
        error.classList.add('show');
        return;
      }
      error.classList.remove('show');
      localStorage.setItem('fg-auth', '1');
      location.href = 'index.html';
    });
  }

  /* ------------------------------------------------------------------ *
   * 登录页
   * ------------------------------------------------------------------ */

  function initLogin() {
    var toggle = document.querySelector('.toggle-pw');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var input = document.getElementById('loginPass');
        var show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        toggle.dataset.icon = show ? 'EyeOff' : 'Eye';
        toggle.dataset.iconHydrated = '';
        hydrate(toggle);
      });
    }
    var user = document.getElementById('loginUser');
    if (user) user.focus();
  }

  /* ------------------------------------------------------------------ *
   * 启动
   * ------------------------------------------------------------------ */

  function boot() {
    initTheme();
    buildGlobalOverlays();
    if (page !== 'login') {
      buildShell();
      renderAll();
      renderTrend('7');
    } else {
      initLogin();
    }
    bindEvents();
    hydrate();

    var dateNode = document.getElementById('todayText');
    if (dateNode) {
      var now = new Date();
      var week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      dateNode.textContent = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日 · ' + week[now.getDay()];
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
