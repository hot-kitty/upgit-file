/**
 * Clash Mi iOS / Mihomo JavaScript 覆写
 * 综合用户 clashRule.js 和 VisibleOB/Mihomo_Overwrite 的 clash_mi_overwrite.js
 * 只操作 Clash/Mihomo 配置对象；不调用 Node、浏览器或系统 API。
 * 建议作为唯一 JS 覆写使用。
 */
var ENABLE = true;
var TEST_URL = 'https://www.gstatic.com/generate_204';
var CHECK_INTERVAL = 600;
var EXCLUDE = '^(?!.*(?:剩余|到期|流量|官网|套餐|测试|过期|重置)).*';

var REGIONS = [
  { name: '🇭🇰 香港节点', filter: '(香港|港|HK|Hong.?Kong|🇭🇰)' },
  { name: '🇯🇵 日本节点', filter: '(日本|东京|大阪|JP|Japan|Tokyo|🇯🇵)' },
  { name: '🇸🇬 新加坡节点', filter: '(新加坡|狮城|SG|Singapore|🇸🇬)' },
  { name: '🇺🇸 美国节点', filter: '(美国|洛杉矶|硅谷|西雅图|US|United.?States|America|🇺🇸)' },
  { name: '🇰🇷 韩国节点', filter: '(韩国|首尔|KR|Korea|🇰🇷)' },
  { name: '🇪🇺 欧洲节点', filter: '(英国|法国|德国|意大利|欧洲|UK|France|Germany|Europe|🇬🇧|🇫🇷|🇩🇪|🇮🇹)' },
  { name: '🇹🇼 台湾节点', filter: '(台湾|台北|新北|TW|Taiwan|🇹🇼)' }
];

function provider(name, behavior, url) {
  return {
    type: 'http',
    behavior: behavior,
    format: 'yaml',
    url: url,
    path: './ruleset/ios-custom/' + name + '.yaml',
    interval: 86400
  };
}

function makeRuleProviders() {
  var bm = 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/';
  var loyal = 'https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/';
  return {
    reject: provider('reject', 'domain', loyal + 'reject.txt'),
    direct: provider('direct', 'domain', loyal + 'direct.txt'),
    private: provider('private', 'domain', loyal + 'private.txt'),
    icloud: provider('icloud', 'domain', loyal + 'icloud.txt'),
    apple: provider('apple', 'domain', loyal + 'apple.txt'),
    gfw: provider('gfw', 'domain', loyal + 'gfw.txt'),
    OpenAI: provider('OpenAI', 'classical', bm + 'OpenAI/OpenAI.yaml'),
    Claude: provider('Claude', 'classical', bm + 'Claude/Claude.yaml'),
    Gemini: provider('Gemini', 'classical', bm + 'Gemini/Gemini.yaml'),
    Google: provider('Google', 'classical', bm + 'Google/Google.yaml'),
    Microsoft: provider('Microsoft', 'classical', bm + 'Microsoft/Microsoft.yaml')
  };
}

function group(name, type, members, extra) {
  var g = { name: name, type: type };
  if (members && members.length) g.proxies = members;
  if (type === 'url-test' || type === 'fallback' || type === 'load-balance') {
    g.url = TEST_URL;
    g.interval = CHECK_INTERVAL;
    g.lazy = true;
  }
  if (extra) {
    Object.keys(extra).forEach(function (k) { g[k] = extra[k]; });
  }
  return g;
}

function makeDNS(original) {
  // iOS 上避免自设 DNS listen 端口，维持精简的 DoH 组合。
  var out = Object.assign({}, original || {});
  out.enable = true;
  out.ipv6 = false;
  delete out.listen;
  out['enhanced-mode'] = 'fake-ip';
  out['fake-ip-range'] = '198.18.0.1/16';
  out['default-nameserver'] = ['223.5.5.5', '119.29.29.29'];
  out.nameserver = ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query'];
  out['proxy-server-nameserver'] = ['223.5.5.5', '119.29.29.29'];
  out['nameserver-policy'] = {
    'geosite:private,cn': ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query'],
    'geosite:geolocation-!cn': ['https://1.1.1.1/dns-query', 'https://dns.google/dns-query']
  };
  var filters = Array.isArray(out['fake-ip-filter']) ? out['fake-ip-filter'].slice() : [];
  ['+.lan', '+.local', '+.home.arpa', 'localhost', '+.msftconnecttest.com',
   '+.msftncsi.com', 'time.apple.com', 'time-ios.apple.com',
   'localhost.ptlogin2.qq.com', 'localhost.work.weixin.qq.com'].forEach(function (item) {
    if (filters.indexOf(item) === -1) filters.push(item);
  });
  out['fake-ip-filter'] = filters;
  return out;
}

function main(config) {
  if (!ENABLE) return config;
  if (!config || typeof config !== 'object') return config;

  var nodes = Array.isArray(config.proxies) ? config.proxies : [];
  var providerNames = config['proxy-providers'] && typeof config['proxy-providers'] === 'object'
    ? Object.keys(config['proxy-providers']) : [];
  var validNodes = nodes.filter(function (node) {
    return node && typeof node.name === 'string' && new RegExp(EXCLUDE, 'i').test(node.name);
  }).map(function (node) { return node.name; });
  if (validNodes.length === 0 && providerNames.length === 0) {
    // 无节点时不要生成指向不存在节点的策略组；原配置保持不变。
    return config;
  }

  var dynamic = providerNames.length > 0;
  var allNodeExtra = dynamic ? { 'include-all': true, filter: EXCLUDE } : {};
  var autoMembers = dynamic ? [] : validNodes;
  var regions = [];
  var regionNames = [];
  var aiRegions = [];

  REGIONS.forEach(function (region) {
    var re = new RegExp(region.filter, 'i');
    var matching = nodes.filter(function (node) {
      return node && typeof node.name === 'string' &&
        re.test(node.name) && new RegExp(EXCLUDE, 'i').test(node.name);
    }).map(function (node) { return node.name; });
    // 与 VisibleOB 一样，不建立已知为空的地区组。
    // provider-only 订阅不可静态枚举节点，因此交由自动选择/手动切换。
    if (matching.length === 0) return;
    regions.push(group(region.name, 'url-test', matching, { tolerance: 100 }));
    regionNames.push(region.name);
    if (region.name.indexOf('香港') < 0 && region.name.indexOf('台湾') < 0) aiRegions.push(region.name);
  });

  var groups = [];
  var globalChoices = ['⚡ 自动选择', '🖐 手动选择', '🚑 故障转移'];
  var manualMembers = dynamic ? ['DIRECT'] : validNodes.concat(['DIRECT']);
  groups.push(group('🖐 手动选择', 'select', manualMembers, dynamic ? allNodeExtra : {}));
  groups.push(group('⚡ 自动选择', 'url-test', autoMembers, Object.assign({ tolerance: 100 }, allNodeExtra)));
  groups.push(group('🚑 故障转移', 'fallback', autoMembers, allNodeExtra));
  groups.push(group('节点选择', 'select', globalChoices.concat(regionNames).concat(['DIRECT'])));
  groups.push(group('AI', 'select', aiRegions.length ? aiRegions.concat(['节点选择']) : ['节点选择']));
  groups.push(group('广告过滤', 'select', ['REJECT', 'DIRECT']));
  groups.push(group('全局直连', 'select', ['DIRECT', '节点选择']));
  groups.push(group('漏网之鱼', 'select', ['节点选择', '全局直连']));
  groups = groups.concat(regions);

  config.dns = makeDNS(config.dns);
  config['proxy-groups'] = groups;
  config['rule-providers'] = makeRuleProviders();
  // AI/开发工具优先匹配，Apple/iCloud 和中国流量继续直连。
  config.rules = [
    'DOMAIN-SUFFIX,openai.com,AI',
    'DOMAIN-SUFFIX,chatgpt.com,AI',
    'DOMAIN-SUFFIX,oaistatic.com,AI',
    'DOMAIN-SUFFIX,oaiusercontent.com,AI',
    'DOMAIN-SUFFIX,anthropic.com,AI',
    'DOMAIN-SUFFIX,claude.ai,AI',
    'DOMAIN-SUFFIX,gemini.google.com,AI',
    'DOMAIN-SUFFIX,generativelanguage.googleapis.com,AI',
    'DOMAIN-SUFFIX,github.com,AI',
    'DOMAIN-SUFFIX,github.dev,AI',
    'DOMAIN-SUFFIX,githubusercontent.com,AI',
    'DOMAIN-SUFFIX,github.io,AI',
    'DOMAIN-SUFFIX,cursor.com,AI',
    'DOMAIN-SUFFIX,linux.do,AI',
    'DOMAIN-SUFFIX,deepwiki.com,AI',
    'DOMAIN-SUFFIX,manus.im,AI',
    'RULE-SET,OpenAI,AI',
    'RULE-SET,Claude,AI',
    'RULE-SET,Gemini,AI',
    'RULE-SET,Google,节点选择',
    'RULE-SET,private,全局直连',
    'RULE-SET,reject,广告过滤',
    'RULE-SET,icloud,DIRECT',
    'RULE-SET,apple,DIRECT',
    'RULE-SET,Microsoft,DIRECT',
    'DOMAIN-SUFFIX,bing.com,DIRECT',
    'DOMAIN-SUFFIX,cn.bing.com,DIRECT',
    'DOMAIN-SUFFIX,jsdelivr.net,DIRECT',
    'DOMAIN-SUFFIX,jsdelivr.com,DIRECT',
    'DOMAIN-SUFFIX,xget.xi-xu.me,DIRECT',
    'DOMAIN-SUFFIX,doubao.com,DIRECT',
    'DOMAIN-SUFFIX,tongyuan.cc,DIRECT',
    'RULE-SET,direct,全局直连',
    'RULE-SET,gfw,节点选择',
    'GEOIP,LAN,DIRECT,no-resolve',
    'GEOIP,CN,DIRECT,no-resolve',
    'MATCH,漏网之鱼'
  ];
  return config;
}
