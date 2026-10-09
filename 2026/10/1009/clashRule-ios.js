/**
 * Clash Mi (iOS) / Mihomo 轻量覆写
 * 用法：在 Clash Mi 的「核心设置 -> 覆写」中按 JS 类型导入。
 * 本脚本仅修改配置，不会直接启动 VPN；如果应用仍闪退，应检查 App 版本和内核日志。
 */

function main(config) {
  if (!config || typeof config !== 'object') return config;

  // iOS 优先保证稳定；默认不改动订阅携带的代理节点、端口、TUN 设置。
  var nodes = Array.isArray(config.proxies) ? config.proxies : [];
  var providerMap = config['proxy-providers'] || {};
  var providers = Object.keys(providerMap).filter(function (key) {
    var p = providerMap[key];
    return p && typeof p === 'object';
  });
  var nodeNames = nodes.filter(function (p) { return p && typeof p.name === 'string'; })
    .map(function (p) { return p.name; });

  // 不因节点暂时为空而 throw，避免订阅解析期直接失败。
  if (!nodeNames.length && !providers.length) return config;

  function unique(arr) {
    return arr.filter(function (x, i) { return arr.indexOf(x) === i; });
  }
  function proxyOpts(names) {
    var opts = { proxies: unique(names) };
    if (providers.length) opts.use = providers.slice();
    return opts;
  }
  function group(name, type, names, extra) {
    var x = { name: name, type: type };
    var selection = proxyOpts(names);
    x.proxies = selection.proxies;
    if (selection.use) x.use = selection.use;
    if (extra) Object.keys(extra).forEach(function (key) { x[key] = extra[key]; });
    return x;
  }
  var testUrl = 'http://www.gstatic.com/generate_204';
  var groups = [];
  var regions = [
    ['🇭🇰 香港节点', /香港|\bHK\b|Hong ?Kong|🇭🇰/i],
    ['🇯🇵 日本节点', /日本|\bJP\b|Japan|🇯🇵/i],
    ['🇸🇬 新加坡节点', /新加坡|狮城|\bSG\b|Singapore|🇸🇬/i],
    ['🇺🇸 美国节点', /美国|\bUS\b|United States|America|🇺🇸/i],
    ['🇰🇷 韩国节点', /韩国|\bKR\b|Korea|🇰🇷/i],
    ['🇪🇺 欧洲节点', /英国|德国|法国|意大利|欧洲|\bUK\b|Europe|Germany|France|Italy|🇪🇺/i]
  ];
  var regionNames = [];
  regions.forEach(function (entry) {
    var matched = nodeNames.filter(function (name) { return entry[1].test(name); });
    // provider-only 模式下，使用 filter 来动态挑选地区节点。
    if (matched.length || providers.length) {
      var options = { url: testUrl, interval: 600, tolerance: 100 };
      if (providers.length) options.filter = entry[1].source.replace(/\\b/g, '');
      groups.push(group(entry[0], 'url-test', matched, options));
      regionNames.push(entry[0]);
    }
  });

  // 兼容静态 proxies 和通过 proxy-providers 加载的节点。
  // 自动组避免 include-all 与 use 叠加，减少部分 iOS 版本解析差异。
  var auto = group('⚡ 延迟选优', 'url-test', nodeNames, {
    url: testUrl, interval: 600, tolerance: 100
  });
  var fallback = group('🚑 故障转移', 'fallback', nodeNames, {
    url: testUrl, interval: 600
  });
  var selectNames = unique(regionNames.concat(['⚡ 延迟选优', '🚑 故障转移']).concat(nodeNames));
  if (!selectNames.length) selectNames = ['DIRECT'];
  var aiNames = regionNames.filter(function (name) { return name.indexOf('香港') === -1; });
  if (!aiNames.length) aiNames = ['节点选择'];

  // 策略组优先保留简单类型，不使用桌面专属 icon、hidden、进程识别等配置。
  config['proxy-groups'] = [
    { name: '节点选择', type: 'select', proxies: selectNames },
    { name: 'AI', type: 'select', proxies: aiNames },
    auto,
    fallback
  ].concat(groups, [
    { name: '广告过滤', type: 'select', proxies: ['REJECT', 'DIRECT'] },
    { name: '全局直连', type: 'select', proxies: ['DIRECT', '节点选择'] },
    { name: '漏网之鱼', type: 'select', proxies: ['节点选择', 'DIRECT'] }
  ]);

  // 不强占 iOS VPN 的监听端口；DNS 采用少量服务器，降低连接初始化压力。
  // 不覆盖已有 DNS 的全部内容，保留订阅中的必要配置。
  var dns = config.dns && typeof config.dns === 'object' ? config.dns : {};
  dns.enable = true;
  dns.ipv6 = false;
  delete dns.listen;
  dns['enhanced-mode'] = 'fake-ip';
  dns['fake-ip-range'] = '198.18.0.1/16';
  dns['fake-ip-filter'] = unique((Array.isArray(dns['fake-ip-filter']) ? dns['fake-ip-filter'] : []).concat([
    '*.lan', '*.local', 'localhost', '*.msftconnecttest.com', '*.msftncsi.com'
  ]));
  dns['default-nameserver'] = ['223.5.5.5', '119.29.29.29'];
  dns.nameserver = ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query'];
  dns.fallback = ['https://1.1.1.1/dns-query', 'https://8.8.8.8/dns-query'];
  dns['fallback-filter'] = { geoip: true, 'geoip-code': 'CN' };
  // 避免依赖未初始化的 geosite 数据库。
  delete dns['nameserver-policy'];
  delete dns['proxy-server-nameserver'];
  config.dns = dns;

  // 轻量规则集：减少 iOS VPN 扩展首次启动时的网络下载、内存与解析负担。
  // remote 规则文件为 Clash YAML 格式（payload: ...），不是纯文本列表。
  var common = { type: 'http', format: 'yaml', interval: 86400 };
  function ruleset(url, behavior, path) {
    return { type: common.type, format: common.format, interval: common.interval,
      behavior: behavior, url: url, path: path };
  }
  var ls = 'https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/';
  var bm = 'https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/';
  config['rule-providers'] = {
    reject: ruleset(ls + 'reject.txt', 'domain', './ruleset/ios/reject.yaml'),
    private: ruleset(ls + 'private.txt', 'domain', './ruleset/ios/private.yaml'),
    direct: ruleset(ls + 'direct.txt', 'domain', './ruleset/ios/direct.yaml'),
    gfw: ruleset(ls + 'gfw.txt', 'domain', './ruleset/ios/gfw.yaml'),
    cncidr: ruleset(ls + 'cncidr.txt', 'ipcidr', './ruleset/ios/cncidr.yaml'),
    OpenAI: ruleset(bm + 'OpenAI/OpenAI.yaml', 'classical', './ruleset/ios/OpenAI.yaml'),
    Claude: ruleset(bm + 'Claude/Claude.yaml', 'classical', './ruleset/ios/Claude.yaml'),
    Gemini: ruleset(bm + 'Gemini/Gemini.yaml', 'classical', './ruleset/ios/Gemini.yaml')
  };

  config.rules = [
    // 本地网络 / Apple、iCloud / Microsoft 中国优先直连。
    'DOMAIN-SUFFIX,local,DIRECT',
    'DOMAIN-SUFFIX,lan,DIRECT',
    'DOMAIN-SUFFIX,icloud.com,DIRECT',
    'DOMAIN-SUFFIX,apple.com,DIRECT',
    'DOMAIN-SUFFIX,apple-dns.net,DIRECT',
    'DOMAIN-SUFFIX,cn.bing.com,DIRECT',
    'DOMAIN-SUFFIX,jsdelivr.net,DIRECT',
    'DOMAIN-SUFFIX,jsdelivr.com,DIRECT',
    'DOMAIN-SUFFIX,doubao.com,DIRECT',
    'DOMAIN-SUFFIX,tongyuan.cc,DIRECT',
    'DOMAIN-SUFFIX,xget.xi-xu.me,DIRECT',
    // AI / 开发者工具：去除 iOS 无意义的 PROCESS-NAME 系列规则。
    'RULE-SET,OpenAI,AI',
    'RULE-SET,Claude,AI',
    'RULE-SET,Gemini,AI',
    'DOMAIN-SUFFIX,anthropic.com,AI',
    'DOMAIN-SUFFIX,claude.ai,AI',
    'DOMAIN-SUFFIX,openai.com,AI',
    'DOMAIN-SUFFIX,chatgpt.com,AI',
    'DOMAIN-SUFFIX,github.com,AI',
    'DOMAIN-SUFFIX,github.dev,AI',
    'DOMAIN-SUFFIX,github.io,节点选择',
    'DOMAIN-SUFFIX,cursor.com,AI',
    'DOMAIN-SUFFIX,linux.do,AI',
    'DOMAIN-SUFFIX,googleapis.cn,节点选择',
    'DOMAIN-SUFFIX,gstatic.com,节点选择',
    'DOMAIN-SUFFIX,telegram.org,节点选择',
    'DOMAIN-SUFFIX,discord.com,节点选择',
    'DOMAIN-SUFFIX,x.com,节点选择',
    'DOMAIN-SUFFIX,twitter.com,节点选择',
    'RULE-SET,private,DIRECT',
    'RULE-SET,reject,广告过滤',
    'RULE-SET,direct,DIRECT',
    'RULE-SET,gfw,节点选择',
    'GEOIP,LAN,DIRECT,no-resolve',
    'RULE-SET,cncidr,DIRECT,no-resolve',
    'GEOIP,CN,DIRECT,no-resolve',
    'MATCH,漏网之鱼'
  ];
  return config;
}
