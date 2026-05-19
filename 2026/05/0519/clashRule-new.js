// 总开关
const enable = true
// AI 分组名
const forOpenai = 'AI'

// 国内DNS服务器
const domesticNameservers = [
  'https://dns.alidns.com/dns-query', // 阿里云公共DNS
  'https://doh.pub/dns-query', // 腾讯DNSPod
  'https://doh.360.cn/dns-query', // 360安全DNS
]
// 国外DNS服务器
const foreignNameservers = [
  'https://1.1.1.1/dns-query', // Cloudflare(主)
  'https://1.0.0.1/dns-query', // Cloudflare(备)
  'https://208.67.222.222/dns-query', // OpenDNS(主)
  'https://208.67.220.220/dns-query', // OpenDNS(备)
  'https://194.242.2.2/dns-query', // Mullvad(主)
  'https://194.242.2.3/dns-query', // Mullvad(备)
]
// DNS配置
const dnsConfig = {
  enable: true,
  listen: '0.0.0.0:1053',
  ipv6: true,
  'use-system-hosts': false,
  'cache-algorithm': 'arc',
  'enhanced-mode': 'fake-ip',
  'fake-ip-range': '198.18.0.1/16',
  'fake-ip-filter': [
    // 本地主机/设备
    '+.lan',
    '+.local',
    // Windows网络出现小地球图标
    '+.msftconnecttest.com',
    '+.msftncsi.com',
    // QQ快速登录检测失败
    'localhost.ptlogin2.qq.com',
    'localhost.sec.qq.com',
    // 微信快速登录检测失败
    'localhost.work.weixin.qq.com',
  ],
  'default-nameserver': ['223.5.5.5', '119.29.29.29', '1.1.1.1', '8.8.8.8'],
  nameserver: [...domesticNameservers, ...foreignNameservers],
  'proxy-server-nameserver': [...domesticNameservers, ...foreignNameservers],
  'nameserver-policy': {
    'geosite:private,cn,geolocation-cn': domesticNameservers,
    'geosite:google,youtube,telegram,gfw,geolocation-!cn': foreignNameservers,
  },
}
// 规则集通用配置
const ruleProviderCommon = {
  type: 'http',
  format: 'yaml',
  interval: 86400,
}
// 规则集配置
const ruleProviders = {
  // Loyalsoldier 规则集
  reject: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt',
    path: './ruleset/loyalsoldier/reject.yaml',
  },
  icloud: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt',
    path: './ruleset/loyalsoldier/icloud.yaml',
  },
  apple: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt',
    path: './ruleset/loyalsoldier/apple.yaml',
  },
  google: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt',
    path: './ruleset/loyalsoldier/google.yaml',
  },
  proxy: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt',
    path: './ruleset/loyalsoldier/proxy.yaml',
  },
  direct: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/direct.txt',
    path: './ruleset/loyalsoldier/direct.yaml',
  },
  private: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt',
    path: './ruleset/loyalsoldier/private.yaml',
  },
  gfw: {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt',
    path: './ruleset/loyalsoldier/gfw.yaml',
  },
  'tld-not-cn': {
    ...ruleProviderCommon,
    behavior: 'domain',
    url: 'https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt',
    path: './ruleset/loyalsoldier/tld-not-cn.yaml',
  },
  telegramcidr: {
    ...ruleProviderCommon,
    behavior: 'ipcidr',
    url: 'https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt',
    path: './ruleset/loyalsoldier/telegramcidr.yaml',
  },
  cncidr: {
    ...ruleProviderCommon,
    behavior: 'ipcidr',
    url: 'https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt',
    path: './ruleset/loyalsoldier/cncidr.yaml',
  },
  lancidr: {
    ...ruleProviderCommon,
    behavior: 'ipcidr',
    url: 'https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt',
    path: './ruleset/loyalsoldier/lancidr.yaml',
  },
  applications: {
    ...ruleProviderCommon,
    behavior: 'classical',
    url: 'https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt',
    path: './ruleset/loyalsoldier/applications.yaml',
  },
  // blackmatrix7 规则集（AI / 通讯类）
  OpenAI: {
    ...ruleProviderCommon,
    behavior: 'classical',
    url: 'https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/OpenAI/OpenAI.yaml',
    path: './ruleset/blackmatrix7/OpenAI.yaml',
  },
  Claude: {
    ...ruleProviderCommon,
    behavior: 'classical',
    url: 'https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Claude/Claude.yaml',
    path: './ruleset/blackmatrix7/Claude.yaml',
  },
  Gemini: {
    ...ruleProviderCommon,
    behavior: 'classical',
    url: 'https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Gemini/Gemini.yaml',
    path: './ruleset/blackmatrix7/Gemini.yaml',
  },
  GoogleFull: {
    ...ruleProviderCommon,
    behavior: 'classical',
    url: 'https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Google/Google.yaml',
    path: './ruleset/blackmatrix7/Google.yaml',
  },
  Twitter: {
    ...ruleProviderCommon,
    behavior: 'classical',
    url: 'https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Twitter/Twitter.yaml',
    path: './ruleset/blackmatrix7/Twitter.yaml',
  },
  Telegram: {
    ...ruleProviderCommon,
    behavior: 'classical',
    url: 'https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Telegram/Telegram.yaml',
    path: './ruleset/blackmatrix7/Telegram.yaml',
  },
  Discord: {
    ...ruleProviderCommon,
    behavior: 'classical',
    url: 'https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Discord/Discord.yaml',
    path: './ruleset/blackmatrix7/Discord.yaml',
  },
  Microsoft: {
    ...ruleProviderCommon,
    behavior: 'classical',
    url: 'https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Microsoft/Microsoft.yaml',
    path: './ruleset/blackmatrix7/Microsoft.yaml',
  },
}

// 地区分组定义（顺序即在「节点选择」中展示的顺序）
const regionGroupDefs = [
  {
    name: '🇭🇰 香港节点',
    regex: /香港|HK|Hong Kong|HongKong|🇭🇰/,
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/hk.svg',
  },
  {
    name: '🇯🇵 日本节点',
    regex: /日本|JP|Japan|🇯🇵/,
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/jp.svg',
  },
  {
    name: '🇸🇬 新加坡节点',
    regex: /新加坡|狮城|SG|Singapore|🇸🇬/,
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/sg.svg',
  },
  {
    name: '🇺🇲 美国节点',
    regex: /美国|US|United States|America|🇺🇸/,
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/um.svg',
  },
  {
    name: '🇰🇷 韩国节点',
    regex: /韩国|移动优化|KR|Korea|🇰🇷/,
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/kr.svg',
  },
  {
    name: '🇪🇺 欧洲节点',
    regex: /英国|UK|United Kingdom|法国|France|德国|Germany|意大利|Italy|欧洲|Europe|🇬🇧|🇫🇷|🇩🇪|🇮🇹/,
    icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/eu.svg',
  },
]

// 代理组通用配置
const groupBaseOption = {
  interval: 300,
  timeout: 3000,
  url: 'https://www.google.com/generate_204',
  lazy: true,
  'max-failed-times': 3,
  hidden: false,
}

// 根据正则在 proxies 中筛选匹配的节点名；若 config 无 proxies 字段则返回空数组
function pickProxiesByRegex(config, regex) {
  const list = Array.isArray(config?.proxies) ? config.proxies : []
  return list.filter(p => regex.test(p.name)).map(p => p.name)
}

// 构造地区分组（若无匹配节点则跳过）
function buildRegionGroups(config) {
  const groups = []
  const nameMap = {} // key -> groupName | null
  for (const def of regionGroupDefs) {
    const proxies = pickProxiesByRegex(config, def.regex)
    if (proxies.length === 0) {
      nameMap[def.name] = null
      continue
    }
    groups.push({
      ...groupBaseOption,
      name: def.name,
      type: 'url-test',
      url: 'http://www.gstatic.com/generate_204',
      interval: 86400,
      tolerance: 100,
      proxies,
      icon: def.icon,
    })
    nameMap[def.name] = def.name
  }
  return { groups, nameMap }
}

// 程序入口
function main(config) {
  if (!enable) {
    return config
  }

  const proxyCount = config?.proxies?.length ?? 0
  const proxyProviderCount =
    typeof config?.['proxy-providers'] === 'object' ? Object.keys(config['proxy-providers']).length : 0
  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error('配置文件中未找到任何代理')
  }

  // 覆盖原配置中DNS配置
  config['dns'] = dnsConfig

  // 构建地区分组
  const { groups: regionGroups, nameMap } = buildRegionGroups(config)
  const HKGroupName = nameMap['🇭🇰 香港节点']
  const JPGroupName = nameMap['🇯🇵 日本节点']
  const SGGroupName = nameMap['🇸🇬 新加坡节点']
  const USGroupName = nameMap['🇺🇲 美国节点']
  const KRGroupName = nameMap['🇰🇷 韩国节点']
  const EUGroupName = nameMap['🇪🇺 欧洲节点']

  // AI 分组候选（沿用旧版顺序：SG → JP → US → KR → EU；HK 不参与）
  const aiCandidates = [SGGroupName, JPGroupName, USGroupName, KRGroupName, EUGroupName].filter(Boolean)

  // 节点选择候选：地区组 + 策略组（地区在前更直观）
  const selectionCandidates = [
    ...regionGroups.map(g => g.name),
    '⚡ 延迟选优',
    '🚑 故障转移',
    '🎲 负载均衡(散列)',
    '🔁 负载均衡(轮询)',
  ]

  // 服务类分组通用候选（与「节点选择」对齐，最简）
  const serviceProxies = ['节点选择', '全局直连', ...selectionCandidates]

  // 覆盖原配置中的代理组
  config['proxy-groups'] = [
    {
      ...groupBaseOption,
      name: '节点选择',
      type: 'select',
      proxies: selectionCandidates,
      icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg',
    },
    {
      ...groupBaseOption,
      name: forOpenai,
      type: 'select',
      proxies: aiCandidates.length > 0 ? aiCandidates : ['节点选择'],
      icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/chatgpt.svg',
    },
    // 地区分组（紧随节点选择 / AI 之后）

    {
      ...groupBaseOption,
      name: '⚡ 延迟选优',
      type: 'url-test',
      tolerance: 100,
      'include-all': true,
      icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/speed.svg',
    },
    ...regionGroups,
    {
      ...groupBaseOption,
      name: '🚑 故障转移',
      type: 'fallback',
      'include-all': true,
      icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/ambulance.svg',
    },
    {
      ...groupBaseOption,
      name: '🎲 负载均衡(散列)',
      type: 'load-balance',
      strategy: 'consistent-hashing',
      'include-all': true,
      icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/merry_go.svg',
    },
    {
      ...groupBaseOption,
      name: '🔁 负载均衡(轮询)',
      type: 'load-balance',
      strategy: 'round-robin',
      'include-all': true,
      icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/balance.svg',
    },
    {
      ...groupBaseOption,
      name: '广告过滤',
      type: 'select',
      proxies: ['REJECT', 'DIRECT'],
      icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/bug.svg',
    },
    {
      ...groupBaseOption,
      name: '全局直连',
      type: 'select',
      hidden: true,
      proxies: ['DIRECT', '节点选择'],
      icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg',
    },
    {
      ...groupBaseOption,
      name: '全局拦截',
      type: 'select',
      hidden: true,
      proxies: ['REJECT', 'DIRECT'],
      icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/block.svg',
    },
    {
      ...groupBaseOption,
      name: '漏网之鱼',
      type: 'select',
      proxies: ['节点选择', '全局直连'],
      icon: 'https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg',
    },
  ]

  // 规则集
  config['rule-providers'] = ruleProviders

  // Gemini / Google 走新加坡（无 SG 节点时回落到 AI 分组）
  const geminiTarget = SGGroupName || forOpenai

  // 规则（AI 段前置，Loyalsoldier 段保留）
  config['rules'] = [
    // —— 微软中国 & 本地直连 ——
    'GEOSITE,microsoft@cn,DIRECT',
    'DOMAIN-KEYWORD,bing.com,DIRECT',
    'DOMAIN-SUFFIX,tongyuan.cc,DIRECT',
    // —— AI / 开发者相关 ——
    'GEOSITE,openai,' + forOpenai,
    'RULE-SET,OpenAI,' + forOpenai,
    'RULE-SET,Claude,' + forOpenai,
    'RULE-SET,Gemini,' + geminiTarget,
    'RULE-SET,GoogleFull,' + geminiTarget,
    'RULE-SET,Twitter,' + forOpenai,
    'RULE-SET,Telegram,' + forOpenai,
    'RULE-SET,Discord,' + forOpenai,
    'DOMAIN,servd-anthropic-website.b-cdn.net,' + forOpenai,
    'DOMAIN,cdn.usefathom.com,' + forOpenai,
    'DOMAIN-SUFFIX,anthropic.com,' + forOpenai,
    'DOMAIN-SUFFIX,claude.ai,' + forOpenai,
    'DOMAIN-SUFFIX,generativelanguage.googleapis.com,' + forOpenai,
    'DOMAIN-SUFFIX,fuclaude.com,' + forOpenai,
    'DOMAIN-SUFFIX,linux.do,' + forOpenai,
    'DOMAIN-SUFFIX,github.com,' + forOpenai,
    'DOMAIN-SUFFIX,cursor.com,' + forOpenai,
    'DOMAIN-KEYWORD,manus.im,' + forOpenai,
    'DOMAIN-KEYWORD,deepwiki.com,' + forOpenai,
    'DOMAIN-KEYWORD,linux.do,' + forOpenai,
    'DOMAIN-KEYWORD,github.com,' + forOpenai,
    'PROCESS-NAME,Cursor.exe,' + forOpenai,
    // —— 自定义直达 / 节点选择 ——
    'DOMAIN-SUFFIX,googleapis.cn,节点选择',
    'DOMAIN-SUFFIX,gstatic.com,节点选择',
    'DOMAIN-SUFFIX,xn--ngstr-lra8j.com,节点选择',
    'DOMAIN-SUFFIX,github.io,节点选择',
    'DOMAIN,v2rayse.com,节点选择',
    // —— Loyalsoldier 规则集 ——
    'RULE-SET,applications,全局直连',
    'RULE-SET,private,全局直连',
    'RULE-SET,reject,广告过滤',
    'RULE-SET,icloud,DIRECT',

    'RULE-SET,proxy,节点选择',
    'RULE-SET,gfw,节点选择',
    'RULE-SET,tld-not-cn,节点选择',
    'RULE-SET,direct,全局直连',
    'RULE-SET,lancidr,全局直连,no-resolve',
    'RULE-SET,cncidr,全局直连,no-resolve',
    'RULE-SET,Microsoft,DIRECT',
    // —— 兜底 ——
    'GEOIP,LAN,全局直连,no-resolve',
    'GEOIP,CN,全局直连,no-resolve',
    'MATCH,漏网之鱼',
  ]

  return config
}
