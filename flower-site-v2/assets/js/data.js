/* 护花使者管理后台 - 演示数据（对接后端后可整体替换） */
(function (global) {
  'use strict';

  function series(count, base, step, wobble) {
    var labels = [], sales = [], orders = [];
    var seed = 7;
    for (var i = 0; i < count; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      var r = seed / 233280;
      var d = new Date(2026, 10, 17 - (count - 1 - i));
      labels.push((d.getMonth() + 1) + '/' + String(d.getDate()).padStart(2, '0'));
      sales.push(Math.round(base + i * step + (r - 0.5) * wobble));
      orders.push(Math.round(base / 95 + i * step / 95 + (r - 0.5) * (wobble / 12)));
    }
    return { labels: labels, sales: sales, orders: orders };
  }

  var DATA = {
    kpis: [
      { label: '总营收', value: '¥128,460', delta: 12.8, note: '较上月', icon: 'Coins', tone: '' },
      { label: '订单总数', value: '1,284', delta: 8.2, note: '较上月', icon: 'Receipt', tone: 'blue' },
      { label: '活跃用户', value: '8,642', delta: 16.4, note: '较上月', icon: 'Users', tone: 'green' },
      { label: 'AI 诊断次数', value: '3,271', delta: 21.6, note: '较上月', icon: 'Stethoscope', tone: 'violet' }
    ],
    trend: {
      '7': series(7, 3200, 260, 900),
      '30': series(30, 2400, 42, 1200),
      '90': series(90, 1700, 18, 1500)
    },
    todos: [
      { icon: 'Receipt', tone: '', title: '待确认订单', meta: '需在 2 小时内处理', count: 12, target: 'orders.html' },
      { icon: 'Leaf', tone: 'green', title: '待审核植物词条', meta: '内容质量与分类校验', count: 5, target: 'plants.html' },
      { icon: 'AlertTriangle', tone: 'amber', title: '高风险诊断复核', meta: 'AI 置信度低于 60%', count: 3, target: 'diagnosis.html' }
    ],
    recentDiagnoses: [
      { name: '月季 · 叶片黄斑', meta: '疑似缺铁性黄化 · 3 分钟前', value: '86%' },
      { name: '绿萝 · 叶尖焦枯', meta: '疑似浇水过量 · 18 分钟前', value: '92%' },
      { name: '多肉 · 茎部软化', meta: '疑似黑腐病 · 42 分钟前', value: '74%' },
      { name: '栀子花 · 叶片发白', meta: '疑似土壤碱化 · 1 小时前', value: '81%' }
    ],
    topProducts: [
      { name: '室内观叶植物养护套装', sku: 'FG-CARE-001', sold: 328, revenue: '¥12,456', trend: 18.2 },
      { name: '缓释有机肥颗粒 500g', sku: 'FG-FERT-014', sold: 286, revenue: '¥9,182', trend: 12.6 },
      { name: '精准控水壶 1.5L', sku: 'FG-TOOL-008', sold: 214, revenue: '¥7,698', trend: -3.4 },
      { name: '多肉植物专属土壤', sku: 'FG-SOIL-003', sold: 178, revenue: '¥5,340', trend: 8.1 }
    ],
    latestOrders: [
      { no: 'FG20261117001', customer: '林晓', amount: '¥268.00', status: 'pending', time: '10:42' },
      { no: 'FG20261117002', customer: '陈默', amount: '¥139.00', status: 'confirmed', time: '10:18' },
      { no: 'FG20261117003', customer: '苏雨晴', amount: '¥526.00', status: 'shipped', time: '09:57' },
      { no: 'FG20261116098', customer: '周然', amount: '¥89.00', status: 'completed', time: '昨天' }
    ],

    users: [
      { name: '林晓', email: 'linxiao@example.com', phone: '138****2046', role: '普通用户', plants: 12, orders: 4, status: 'active', joined: '2026-11-12' },
      { name: '陈默', email: 'chenmo@example.com', phone: '139****7712', role: '普通用户', plants: 7, orders: 9, status: 'active', joined: '2026-11-08' },
      { name: '苏雨晴', email: 'suyuqing@example.com', phone: '158****3391', role: '内容编辑', plants: 24, orders: 2, status: 'active', joined: '2026-10-29' },
      { name: '周然', email: 'zhouran@example.com', phone: '186****8804', role: '普通用户', plants: 3, orders: 1, status: 'active', joined: '2026-10-24' },
      { name: '许 Alberts', email: 'xuke@example.com', phone: '137****5018', role: '普通用户', plants: 18, orders: 6, status: 'active', joined: '2026-10-19' },
      { name: '何思远', email: 'hesiyuan@example.com', phone: '135****6672', role: '管理员', plants: 31, orders: 11, status: 'active', joined: '2026-09-30' },
      { name: '唐宁', email: 'tangning@example.com', phone: '188****1209', role: '普通用户', plants: 5, orders: 0, status: 'inactive', joined: '2026-09-22' },
      { name: '沈知夏', email: 'shenzhixia@example.com', phone: '150****4487', role: '内容编辑', plants: 16, orders: 3, status: 'active', joined: '2026-09-14' },
      { name: '顾言', email: 'guyan@example.com', phone: '133****9921', role: '普通用户', plants: 2, orders: 2, status: 'active', joined: '2026-08-28' },
      { name: '叶清和', email: 'yeqinghe@example.com', phone: '177****3045', role: '普通用户', plants: 9, orders: 5, status: 'active', joined: '2026-08-16' },
      { name: '程一诺', email: 'chengyinuo@example.com', phone: '152****7186', role: '普通用户', plants: 0, orders: 0, status: 'inactive', joined: '2026-07-30' },
      { name: '罗景', email: 'luojing@example.com', phone: '136****2210', role: '普通用户', plants: 14, orders: 7, status: 'active', joined: '2026-07-11' }
    ],

    plants: [
      { name: '月季', scientific: 'Rosa chinensis', category: '花卉', care: 3, tags: ['喜阳', '勤修剪'], views: 12840, status: 'published', updated: '2026-11-16', icon: 'Leaf', tone: 'red' },
      { name: '绿萝', scientific: 'Epipremnum aureum', category: '观叶植物', care: 1, tags: ['耐阴', '易养护'], views: 22610, status: 'published', updated: '2026-11-15', icon: 'Leaf', tone: '' },
      { name: '琴叶榕', scientific: 'Ficus lyrata', category: '观叶植物', care: 3, tags: ['喜光', '忌积水'], views: 9870, status: 'published', updated: '2026-11-14', icon: 'Leaf', tone: '' },
      { name: '熊童子', scientific: 'Cotyledon tomentosa', category: '多肉植物', care: 2, tags: ['耐旱', '喜阳'], views: 6430, status: 'review', updated: '2026-11-14', icon: 'Leaf', tone: 'amber' },
      { name: '栀子花', scientific: 'Gardenia jasminoides', category: '花卉', care: 4, tags: ['喜酸', '喜湿'], views: 11290, status: 'published', updated: '2026-11-12', icon: 'Leaf', tone: 'red' },
      { name: '龟背竹', scientific: 'Monstera deliciosa', category: '观叶植物', care: 2, tags: ['耐阴', '喜湿'], views: 18320, status: 'published', updated: '2026-11-10', icon: 'Leaf', tone: '' },
      { name: '薄荷', scientific: 'Mentha canadensis', category: '香草植物', care: 1, tags: ['喜阳', '可食用'], views: 7210, status: 'published', updated: '2026-11-08', icon: 'Leaf', tone: 'blue' },
      { name: '蝴蝶兰', scientific: 'Phalaenopsis', category: '花卉', care: 4, tags: ['耐阴', '忌积水'], views: 9080, status: 'review', updated: '2026-11-07', icon: 'Leaf', tone: 'violet' },
      { name: '金琥', scientific: 'Echinocactus grusonii', category: '多肉植物', care: 1, tags: ['耐旱', '喜阳'], views: 4120, status: 'published', updated: '2026-11-03', icon: 'Leaf', tone: 'amber' },
      { name: '长寿花', scientific: 'Kalanchoe blossfeldiana', category: '花卉', care: 2, tags: ['短日照', '耐旱'], views: 8360, status: 'draft', updated: '2026-10-29', icon: 'Leaf', tone: 'red' }
    ],

    diagnoses: [
      { plant: '月季', symptom: '叶片出现黄斑', result: '疑似缺铁性黄化', confidence: 86, source: '拍照识别', status: 'confirmed', time: '10:54', severity: '中' },
      { plant: '绿萝', symptom: '叶尖焦枯', result: '浇水过量 / 根系缺氧', confidence: 92, source: '拍照识别', status: 'confirmed', time: '10:36', severity: '低' },
      { plant: '多肉植物', symptom: '茎部软化发黑', result: '疑似黑腐病', confidence: 74, source: '相册导入', status: 'review', time: '10:12', severity: '高' },
      { plant: '栀子花', symptom: '叶片发白', result: '土壤碱化', confidence: 81, source: '拍照识别', status: 'confirmed', time: '09:48', severity: '中' },
      { plant: '琴叶榕', symptom: '叶片卷曲', result: '空气湿度过低', confidence: 68, source: '拍照识别', status: 'review', time: '09:21', severity: '低' },
      { plant: '薄荷', symptom: '茎秆细长倒伏', result: '光照不足', confidence: 95, source: '相册导入', status: 'confirmed', time: '08:56', severity: '低' },
      { plant: '蝴蝶兰', symptom: '花朵提前萎蔫', result: '环境温度过高', confidence: 59, source: '拍照识别', status: 'review', time: '08:30', severity: '中' },
      { plant: '龟背竹', symptom: '叶面出现斑点', result: '疑似叶斑病', confidence: 77, source: '拍照识别', status: 'confirmed', time: '昨天 21:14', severity: '中' },
      { plant: '月季', symptom: '叶片覆盖白粉', result: '疑似白粉病', confidence: 90, source: '相册导入', status: 'confirmed', time: '昨天 20:02', severity: '高' },
      { plant: '长寿花', symptom: '叶片变软', result: '浇水不足', confidence: 63, source: '拍照识别', status: 'ignored', time: '昨天 18:47', severity: '低' }
    ],
    diagnosisDistribution: [
      { label: '浇水不当', pct: 34, tone: '' },
      { label: '光照问题', pct: 26, tone: 'amber' },
      { label: '缺肥 / 土壤', pct: 19, tone: 'green' },
      { label: '病虫害', pct: 14, tone: 'violet' },
      { label: '其他', pct: 7, tone: 'blue' }
    ],

    products: [
      { name: '室内观叶植物养护套装', sku: 'FG-CARE-001', category: '养护工具', price: 268, stock: 86, sold: 328, status: 'on', icon: 'Sparkles', tone: '' },
      { name: '缓释有机肥颗粒 500g', sku: 'FG-FERT-014', category: '肥料营养', price: 39, stock: 412, sold: 286, status: 'on', icon: 'Leaf', tone: 'green' },
      { name: '精准控水壶 1.5L', sku: 'FG-TOOL-008', category: '养护工具', price: 89, stock: 12, sold: 214, status: 'on', icon: 'Water', tone: 'blue' },
      { name: '多肉植物专属土壤 2L', sku: 'FG-SOIL-003', category: '种植基质', price: 29, stock: 236, sold: 178, status: 'on', icon: 'Leaf', tone: 'amber' },
      { name: '植物补光灯 24W', sku: 'FG-LAMP-021', category: '智能设备', price: 199, stock: 0, sold: 96, status: 'off', icon: 'Lightbulb', tone: 'violet' },
      { name: '病虫害检测卡 10 片装', sku: 'FG-DIAG-006', category: '诊断辅助', price: 49, stock: 158, sold: 142, status: 'on', icon: 'Bug', tone: 'red' },
      { name: '陶瓷花盆 · 莫兰迪灰', sku: 'FG-POT-017', category: '花盆器皿', price: 79, stock: 64, sold: 121, status: 'on', icon: 'Home', tone: 'blue' },
      { name: '园艺剪刀套装', sku: 'FG-TOOL-011', category: '养护工具', price: 119, stock: 9, sold: 88, status: 'on', icon: 'Scissors', tone: '' },
      { name: '月季专用营养液 300ml', sku: 'FG-FERT-023', category: '肥料营养', price: 45, stock: 0, sold: 76, status: 'off', icon: 'Water', tone: 'red' },
      { name: '智能土壤湿度计', sku: 'FG-DEV-004', category: '智能设备', price: 129, stock: 73, sold: 65, status: 'on', icon: 'Activity', tone: 'green' }
    ],

    orders: [
      { no: 'FG20261117001', customer: '林晓', items: '养护套装 ×1、有机肥 ×2', amount: 346, delivery: '快递配送', status: 'pending', time: '2026-11-17 10:42', phone: '138****2046' },
      { no: 'FG20261117002', customer: '陈默', items: '控水壶 ×1、营养液 ×1', amount: 134, delivery: '到店自提', status: 'pending', time: '2026-11-17 10:18', phone: '139****7712' },
      { no: 'FG20261117003', customer: '苏雨晴', items: '补光灯 ×2、花盆 ×1', amount: 477, delivery: '快递配送', status: 'confirmed', time: '2026-11-17 09:57', phone: '158****3391' },
      { no: 'FG20261117004', customer: '周然', items: '多肉土壤 ×3', amount: 87, delivery: '快递配送', status: 'shipped', time: '2026-11-17 09:31', phone: '186****8804' },
      { no: 'FG20261116098', customer: '许 Alberts', items: '检测卡 ×1、剪刀套装 ×1', amount: 168, delivery: '快递配送', status: 'shipped', time: '2026-11-16 21:08', phone: '137****5018' },
      { no: 'FG20261116097', customer: '何思远', items: '养护套装 ×2', amount: 536, delivery: '到店自提', status: 'completed', time: '2026-11-16 19:45', phone: '135****6672' },
      { no: 'FG20261116096', customer: '唐宁', items: '陶瓷花盆 ×1', amount: 79, delivery: '快递配送', status: 'completed', time: '2026-11-16 18:22', phone: '188****1209' },
      { no: 'FG20261116095', customer: '沈知夏', items: '智能湿度计 ×1', amount: 129, delivery: '快递配送', status: 'confirmed', time: '2026-11-16 17:03', phone: '150****4487' },
      { no: 'FG20261116094', customer: '顾言', items: '营养液 ×2', amount: 90, delivery: '到店自提', status: 'cancelled', time: '2026-11-16 15:36', phone: '133****9921' },
      { no: 'FG20261116093', customer: '叶清和', items: '补光灯 ×1、土壤 ×2', amount: 257, delivery: '快递配送', status: 'completed', time: '2026-11-16 14:12', phone: '177****3045' },
      { no: 'FG20261116092', customer: '程一诺', items: '有机肥 ×1', amount: 39, delivery: '快递配送', status: 'pending', time: '2026-11-16 11:48', phone: '152****7186' },
      { no: 'FG20261116091', customer: '罗景', items: '园艺剪刀 ×1', amount: 119, delivery: '快递配送', status: 'completed', time: '2026-11-16 10:05', phone: '136****2210' }
    ],

    channels: [
      { label: '微信小程序', value: 68420, pct: 53, tone: '' },
      { label: 'App 内商城', value: 34180, pct: 27, tone: 'green' },
      { label: '官网直访', value: 15860, pct: 12, tone: 'blue' },
      { label: '社群转介', value: 10000, pct: 8, tone: 'violet' }
    ],
    categories: [
      { label: '养护工具', value: 38, color: '#e94b52' },
      { label: '肥料营养', value: 27, color: '#2f9e6b' },
      { label: '智能设备', value: 18, color: '#3a73c9' },
      { label: '花盆器皿', value: 11, color: '#7659c7' },
      { label: '其他', value: 6, color: '#b97614' }
    ],
    regions: [
      { name: '广东省', users: 2148, orders: 386, amount: '¥32,480' },
      { name: '浙江省', users: 1672, orders: 298, amount: '¥25,610' },
      { name: '江苏省', users: 1436, orders: 254, amount: '¥21,890' },
      { name: '上海市', users: 1184, orders: 231, amount: '¥19,740' },
      { name: '北京市', users: 963, orders: 187, amount: '¥16,320' }
    ],
    monthlyBars: [
      { label: '6月', value: 62 }, { label: '7月', value: 70 }, { label: '8月', value: 66 },
      { label: '9月', value: 81 }, { label: '10月', value: 75 }, { label: '11月', value: 94 }
    ]
  };

  global.FG_DATA = DATA;
})(window);
