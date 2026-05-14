const osMap = {
  'Windows Server 2012 R2 Standard': 'WS 2012R2',
  'Windows Server 2019 Standard': 'WS 2019',
  'Windows Server 2022 Standard': 'WS 2022',
  'Windows 10 Pro': 'Win10 Pro',
  'CentOS 8.5.2111': 'CentOS 8.5',
  'Ubuntu 18.04.4 LTS': 'Ubuntu 18.04.4',
  'Ubuntu 20.04.4 LTS': 'Ubuntu 20.04.4',
  'Windows 11 Pro': 'Win11 Pro',
  'Windows Server 2016 Standard': 'WS 2016',
  'Ubuntu 22.04.5 LTS': 'Ubuntu 22.04.5',
  'Rocky Linux 9.4': 'Rocky 9.4',
  'CentOS 7.7': '',
  'Ubuntu 19.10': '',
  'AlmaLinux 9.4': '',
}

const getOS = (osFullName) => {
  return osMap[osFullName] || osFullName
}

export default getOS
