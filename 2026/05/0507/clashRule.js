// Define main function (script entry)
// 总开关
const enable = true
const forOpenai = 'AI'
function main(params) {
  if (!enable) {
    return params
  }
  const USGroupName = addProxyGroup(params, '🇺🇲 美国节点', /美国|US|United States|America|🇺🇸/)
  const JPGroupName = addProxyGroup(params, '🇯🇵 日本节点', /日本|JP|Japan|🇯🇵/)
  const SGGroupName = addProxyGroup(params, '🇸🇬 新加坡节点', /新加坡|狮城|SG|Singapore|🇸🇬/)
  const HKGroupName = addProxyGroup(params, '🇭🇰 香港节点', /香港|HK|Hong Kong|HongKong|🇭🇰/)
  const KRGroupName = addProxyGroup(params, '🇰🇷 韩国节点', /韩国|移动优化|KR|Korea|🇰🇷/)
  const EUGroupName = addProxyGroup(
    params,
    '🇪🇺 欧洲节点',
    /英国|UK|United Kingdom|法国|France|德国|Germany|意大利|Italy|欧洲|Europe|🇬🇧|🇫🇷|🇩🇪|🇮🇹/
  )
  addGPTProxyGroup(params, USGroupName, JPGroupName, SGGroupName, HKGroupName, KRGroupName, EUGroupName)
  // 添加规则
  addRules(params, USGroupName, JPGroupName, SGGroupName, HKGroupName, KRGroupName, EUGroupName)
  // 添加 rule-providers
  addRuleProviders(params)

  return params
}

function addProxyGroup(params, groupName, regex) {
  // 判断是否已经存在某个代理组（如"美国节点"）的名称
  const group = params['proxy-groups'].find(e => regex.test(e.name) || e.name === groupName)
  if (group === undefined) {
    const proxiesByRegex = params.proxies.filter(e => regex.test(e.name)).map(e => e.name)
    // 判断proxiesByRegex是否为空数组
    if (proxiesByRegex.length === 0) {
      return null // 没有匹配的代理，直接返回
    }
    params['proxy-groups'].push({
      name: groupName,
      type: 'url-test',
      url: 'http://www.gstatic.com/generate_204',
      interval: 86400,
      proxies: proxiesByRegex,
    })
    return groupName // 没有的话就创建一个新的代理组
  }
  // 有了的话直接返回这个代理组的名称
  return group.name
}

function addGPTProxyGroup(params, USGroupName, JPGroupName, SGGroupName, HKGroupName, KRGroupName, EUGroupName) {
  // 创建一个名为"myGPT"的代理组
  params['proxy-groups'].push({
    name: forOpenai,
    type: 'select',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48ZyBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEuNSI+PHBhdGggZD0iTTExLjc0NSAxNC44NUw2LjkwNSAxMlY3YzAtMi4yMSAxLjgyNC00IDQuMDc2LTRjMS4zOTcgMCAyLjYzLjY5IDMuMzY1IDEuNzQxIi8+PHBhdGggZD0iTTkuNiAxOS4xOEE0LjEgNC4xIDAgMCAwIDEzLjAyIDIxYzIuMjUgMCA0LjA3Ni0xLjc5IDQuMDc2LTR2LTVMMTIuMTYgOS4wOTciLz48cGF0aCBkPSJNOS40NTIgMTMuNVY3LjY3bDQuNDEyLTIuNWMxLjk1LTEuMTA1IDQuNDQzLS40NSA1LjU2OSAxLjQ2M2EzLjkzIDMuOTMgMCAwIDEgLjA3NiAzLjg2NiIvPjxwYXRoIGQ9Ik00LjQ5IDEzLjVhMy45MyAzLjkzIDAgMCAwIC4wNzUgMy44NjZjMS4xMjYgMS45MTMgMy42MiAyLjU2OCA1LjU3IDEuNDY0bDQuNDEyLTIuNWwuMDk2LTUuNTk2Ii8+PHBhdGggZD0iTTE3LjA5NiAxNy42M2E0LjA5IDQuMDkgMCAwIDAgMy4zNTctMS45OTZjMS4xMjYtMS45MTMuNDU4LTQuMzYtMS40OTItNS40NjRsLTQuNDEzLTIuNWwtNS4wNTkgMi43NTUiLz48cGF0aCBkPSJNNi45MDUgNi4zN2E0LjA5IDQuMDkgMCAwIDAtMy4zNTggMS45OTZjLTEuMTI2IDEuOTE0LS40NTggNC4zNiAxLjQ5MiA1LjQ2NGw0LjQxMyAyLjVsNS4wNDgtMi43NSIvPjwvZz48L3N2Zz4=',
    proxies: [],
  })

  // 找到新创建的代理组
  const myGPTGroup = params['proxy-groups'].find(group => group.name === forOpenai)

  // 为名为myGPT的代理组添加代理
  // if (HKGroupName !== null) myGPTGroup.proxies.push(HKGroupName)
  if (SGGroupName !== null) myGPTGroup.proxies.push(SGGroupName)
  if (JPGroupName !== null) myGPTGroup.proxies.push(JPGroupName)
  if (USGroupName !== null) myGPTGroup.proxies.push(USGroupName)
  if (KRGroupName !== null) myGPTGroup.proxies.push(KRGroupName)
  if (EUGroupName !== null) myGPTGroup.proxies.push(EUGroupName)
}

function addRuleProviders(params) {
  // 如果 params 中没有 rule-providers，则创建它
  if (!params['rule-providers']) {
    params['rule-providers'] = {}
  }

  // 添加 OpenAI rule provider
  params['rule-providers']['OpenAI'] = {
    type: 'http',
    behavior: 'classical',
    url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/OpenAI/OpenAI.yaml',
    path: './ruleset/OpenAI.yaml',
    interval: 86400,
  }
  params['rule-providers']['Claude'] = {
    type: 'http',
    behavior: 'classical',
    url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Claude/Claude.yaml',
    path: './ruleset/Claude.yaml',
    interval: 86400,
  }
  params['rule-providers']['Twitter'] = {
    type: 'http',
    behavior: 'classical',
    url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Twitter/Twitter.yaml',
    path: './ruleset/Twitter.yaml',
    interval: 86400,
  }
  params['rule-providers']['Google'] = {
    type: 'http',
    behavior: 'classical',
    url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Google/Google.yaml',
    path: './ruleset/Google.yaml',
    interval: 86400,
  }
  params['rule-providers']['Gemini'] = {
    type: 'http',
    behavior: 'classical',
    url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Gemini/Gemini.yaml',
    path: './ruleset/Gemini.yaml',
    interval: 86400,
  }
  params['rule-providers']['Telegram'] = {
    type: 'http',
    behavior: 'classical',
    url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Telegram/Telegram.yaml',
    path: './ruleset/Telegram.yaml',
    interval: 86400,
  }
  params['rule-providers']['Discord'] = {
    type: 'http',
    behavior: 'classical',
    url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Discord/Discord.yaml',
    path: './ruleset/Discord.yaml',
    interval: 86400,
  }
}

function addRules(params, USGroupName, JPGroupName, SGGroupName, HKGroupName, KRGroupName, EUGroupName) {
  // 设置openai用哪个节点访问

  // 创建一个规则数组
  const rules = [
    // 微软中国
    'GEOSITE,microsoft@cn,DIRECT',
    'DOMAIN-KEYWORD,bing.com,DIRECT',
    // openai
    'GEOSITE,openai,' + SGGroupName,
    'RULE-SET,Twitter,' + forOpenai,
    'RULE-SET,Claude,' + forOpenai,
    'RULE-SET,Google,' + SGGroupName,
    'RULE-SET,Gemini,' + SGGroupName,
    'RULE-SET,OpenAI,' + SGGroupName,
    'RULE-SET,Discord,' + forOpenai,
    'RULE-SET,Telegram,' + forOpenai,
    // claude
    'DOMAIN,servd-anthropic-website.b-cdn.net,' + forOpenai,
    'DOMAIN,cdn.usefathom.com,' + forOpenai,
    'DOMAIN-SUFFIX,anthropic.com,' + forOpenai,
    'DOMAIN-SUFFIX,claude.ai,' + forOpenai,
    // gemini api
    'DOMAIN-SUFFIX,generativelanguage.googleapis.com,' + forOpenai,

    // linux.do
    'DOMAIN-SUFFIX,linux.do,' + forOpenai,
    // fuclaude.com
    'DOMAIN-SUFFIX,fuclaude.com,' + forOpenai,
    'DOMAIN-SUFFIX,github.com,' + forOpenai,
    'DOMAIN-SUFFIX,aistudio.google.com,' + SGGroupName,
    'DOMAIN-SUFFIX,cursor.com,' + forOpenai,
    'DOMAIN-KEYWORD,manus.im,' + forOpenai,
    'DOMAIN-KEYWORD,openai.com,' + SGGroupName,
    'DOMAIN-KEYWORD,google-analytics,' + SGGroupName,
    'DOMAIN-KEYWORD,deepwiki.com,' + forOpenai,
    'DOMAIN-KEYWORD,linux.do,' + forOpenai,
    'DOMAIN-KEYWORD,github.com,' + forOpenai,
    'PROCESS-NAME,Cursor.exe,' + forOpenai,
    // 默认配置
    'IP-CIDR,127.0.0.0/8,DIRECT',
    'IP-CIDR,172.16.0.0/12,DIRECT',
    'IP-CIDR,192.168.0.0/16,DIRECT',
    'IP-CIDR,10.0.0.0/8,DIRECT',
    'IP-CIDR,17.0.0.0/8,DIRECT',
    'IP-CIDR,100.64.0.0/10,DIRECT',
    'IP-CIDR,224.0.0.0/4,DIRECT',
    'IP-CIDR6,fe80::/10,DIRECT',
    'DOMAIN-SUFFIX,cn,DIRECT',
    'DOMAIN-KEYWORD,-cn,DIRECT',
    'GEOIP,CN,DIRECT',
    'GEOSITE,CN,DIRECT',
  ]

  // 把rules中的规则全部添加到params.rules中
  params['rules'] = rules.concat(params['rules'])
}
