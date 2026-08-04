const osMap = {
  'Windows Server 2012 R2 Standard': 'WS 2012R2',
  'Windows Server 2019 Standard': 'WS 2019',
  'Windows Server 2022 Standard': 'WS 2022',
  'Windows 10 Pro': 'Win10 Pro',
  'Win10 Enterprise': 'Win10 Enterprise',
  'CentOS 7.9': 'CentOS 7.9',
  'CentOS 7.7': 'CentOS 7.7',
  'CentOS 8.5.2111': 'CentOS 8.5',
  'Ubuntu 18.04.4 LTS': 'Ubuntu 18.04.4',
  'Ubuntu 20.04.4 LTS': 'Ubuntu 20.04.4',
  'Windows 11 Pro': 'Win11 Pro',
  'Windows Server 2016 Standard': 'WS 2016',
  'Ubuntu 22.04.5 LTS': 'Ubuntu 22.04.5',
  'Ubuntu 24.04.4 LTS': 'Ubuntu 24.04.4',
  'Ubuntu 26.04 LTS': 'Ubuntu 26.04',
  'Ubuntu Desktop 26.04 LTS': 'Ubuntu Desktop 26.04',
  'Rocky Linux 9.4': 'Rocky 9.4',
  'AlmaLinux 9.4': 'AlmaLinux 9.4',
}

const getOS = (osFullName) => {
  if (!osFullName) return ''
  return osMap[osFullName] || osFullName
}

export const getShortOS = (osFullName) => {
  if (!osFullName) return ''
  const str = String(osFullName)
  if (/win/i.test(str)) return 'Windows'
  if (/ubuntu/i.test(str)) return 'Ubuntu'
  if (/centos/i.test(str)) return 'CentOS'
  if (/rocky/i.test(str)) return 'Rocky'
  if (/alma/i.test(str)) return 'AlmaLinux'
  if (/debian/i.test(str)) return 'Debian'
  if (/fedora/i.test(str)) return 'Fedora'
  return str.split(' ')[0] || str
}

export default getOS
