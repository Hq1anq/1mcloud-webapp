import useLanguageStore from '../store/useLanguageStore'
import LegalPageLayout from '../components/layout/LegalPageLayout'
import type { LegalPageData } from '../types/legal'

const termsData: Record<'vi' | 'en', LegalPageData> = {
  vi: {
    badge: 'Pháp Lý & Vận Hành',
    title: 'Điều Khoản Dịch Vụ 1MCLOUD',
    subtitle:
      'Quy định sử dụng hạ tầng Cloud, VPS và Proxy với trọng tâm là vận hành hợp pháp, an toàn tài khoản, kiểm soát tài nguyên và trách nhiệm dữ liệu.',
    status: {
      scopeLabel: 'Phạm vi',
      scopeValue: 'Cloud / VPS / Proxy',
      formatLabel: 'Định dạng',
      formatValue: 'Policy Document',
      updatedLabel: 'Cập nhật gần nhất',
      updatedValue: '2026',
    },
    nav: {
      terms: 'Điều khoản dịch vụ',
      privacy: 'Chính sách bảo mật',
    },
    tocTitle: 'Mục Lục',
    note: {
      title: 'Lưu ý vận hành',
      text: 'Bằng việc tạo tài khoản, nạp tiền hoặc khởi tạo máy chủ/proxy trên hệ thống 1MCLOUD, bạn đồng ý tuân thủ toàn bộ điều khoản dưới đây. Vui lòng đọc kỹ để đảm bảo quyền lợi khi vận hành dịch vụ.',
      sourceText: 'Tài liệu tiêu chuẩn dịch vụ',
    },
    sections: [
      {
        id: 'chap-nhan',
        kicker: '01 / Agreement',
        title: 'Chấp nhận điều khoản',
        content: [
          'Khi khởi tạo, đăng ký hoặc tiếp tục sử dụng bất kỳ dịch vụ nào của 1MCLOUD, khách hàng xác nhận đã đọc, hiểu rõ và đồng ý tuân thủ mọi quy định vận hành được công bố tại thời điểm sử dụng.',
          'Điều khoản này có hiệu lực ràng buộc đối với chủ tài khoản, người quản trị kỹ thuật và mọi người dùng được khách hàng cấp quyền truy cập vào máy chủ, proxy hoặc hạ tầng mạng liên quan.',
        ],
      },
      {
        id: 'su-dung-hop-phap',
        kicker: '02 / Compliance',
        title: 'Sử dụng hạ tầng hợp pháp',
        content: [
          'Khách hàng chịu hoàn toàn trách nhiệm đảm bảo máy chủ ảo (VPS), proxy và tài nguyên mạng được sử dụng đúng theo quy định pháp luật Việt Nam cũng như luật pháp quốc tế tại khu vực đặt máy chủ.',
        ],
        bullets: [
          'Tuyệt đối không sử dụng dịch vụ vào mục đích chống phá, vi phạm bản quyền, phát tán văn hóa phẩm đồi trụy hoặc xâm phạm quyền lợi hợp pháp của bên thứ ba.',
          'Không cho phép bên thứ ba lợi dụng tài nguyên của bạn để thực hiện hành vi vi phạm pháp luật hoặc phát tán mã độc.',
          'Khách hàng có nghĩa vụ tự kiểm soát mã nguồn, ứng dụng, website, tài khoản quản trị và dữ liệu đang vận hành trên máy chủ.',
        ],
      },
      {
        id: 'noi-dung-cam',
        kicker: '03 / Prohibited Use',
        title: 'Nội dung và hành vi bị nghiêm cấm',
        content: [
          '1MCLOUD áp dụng chính sách không khoan nhượng đối với các hành vi gây hại đến hệ thống mạng hoặc cộng đồng mạng Internet.',
        ],
        grid: [
          {
            title: 'Spam & Email Hàng Loạt',
            desc: 'Cấm gửi thư rác, quảng cáo không mong muốn, mail bomb hoặc sử dụng máy chủ làm trạm phát tán spam.',
            icon: 'spam',
          },
          {
            title: 'Tấn Công Mạng & Malware',
            desc: 'Cấm thực hiện DDoS, scan port, brute-force, phát tán trojan, ransomware hoặc tham gia botnet.',
            icon: 'attack',
          },
          {
            title: 'Vi Phạm Bản Quyền (DMCA)',
            desc: 'Cấm lưu trữ hoặc chia sẻ nội dung vi phạm quyền tác giả, phần mềm crack, website lừa đảo (phishing).',
            icon: 'copyright',
          },
          {
            title: 'Khai Thác Trái Phép Tài Nguyên',
            desc: 'Cấm đào coin trái phép gây nghẽn phần cứng, chạy tool phá hoại hoặc giả mạo lưu lượng mạng bất hợp pháp.',
            icon: 'mining',
          },
        ],
      },
      {
        id: 'tai-nguyen',
        kicker: '04 / Resource Policy',
        title: 'Quản lý tài nguyên & giới hạn phần cứng',
        content: [
          'Khách hàng được sử dụng tài nguyên trong phạm vi gói dịch vụ đã đăng ký. Hệ thống tự động giám sát để phát hiện các trường hợp lạm dụng CPU 100% kéo dài bất thường, spam I/O ổ đĩa liên tục hoặc chiếm dụng băng thông gây ảnh hưởng đến cụm máy chủ chung.',
          'Khi phát hiện nguy cơ ảnh hưởng đến chất lượng hạ tầng chung, 1MCLOUD có quyền yêu cầu giảm tải, điều tiết băng thông hoặc tạm ngưng phiên làm việc để bảo vệ toàn hệ thống.',
        ],
      },
      {
        id: 'bao-mat',
        kicker: '05 / Security & Credentials',
        title: 'Bảo mật tài khoản & thông tin quản trị',
        content: [
          'Khách hàng có trách nhiệm tự bảo quản mật khẩu tài khoản 1MCLOUD, SSH key, mật khẩu root/Administrator của VPS và thông tin xác thực proxy.',
          'Khi phát hiện có dấu hiệu truy cập trái phép hoặc rò rỉ thông tin đăng nhập, khách hàng cần chủ động đổi mật khẩu và liên hệ bộ phận hỗ trợ của 1MCLOUD sớm nhất có thể.',
        ],
      },
      {
        id: 'du-lieu',
        kicker: '06 / Data & Backup',
        title: 'Dữ liệu và trách nhiệm sao lưu',
        content: [
          '1MCLOUD cam kết đảm bảo tính toàn vẹn phần cứng và uptime mạng 99.99%. Tuy nhiên, khách hàng chịu trách nhiệm chủ động tạo và lưu trữ các bản sao lưu (backup) định kỳ cho mã nguồn, cơ sở dữ liệu và cấu hình hệ thống của mình.',
          '1MCLOUD không chịu trách nhiệm đối với việc mất mát dữ liệu do thao tác xóa nhầm của khách hàng, ứng dụng nội bộ bị lỗi hoặc các nguyên nhân bất khả kháng ngoài tầm kiểm soát hợp lý.',
        ],
      },
      {
        id: 'xu-ly-vi-pham',
        kicker: '07 / Enforcement',
        title: 'Tạm ngưng và chấm dứt dịch vụ',
        content: [
          '1MCLOUD có quyền tạm khóa hoặc chấm dứt dịch vụ ngay lập tức mà không cần báo trước nếu phát hiện khách hàng vi phạm nghiêm trọng các hành vi bị nghiêm cấm (DDoS, tấn công mạng, phát tán mã độc).',
          'Đối với các vi phạm do vô ý hoặc cảnh báo từ nhà mạng, khách hàng sẽ có thời gian xử lý và cam kết khắc phục để mở lại tài nguyên.',
        ],
      },
      {
        id: 'gia-han',
        kicker: '08 / Renewal & Expiration',
        title: 'Gia hạn và thanh lý dịch vụ quá hạn',
        content: [
          'Hệ thống tự động gửi thông báo nhắc gia hạn trước ngày hết hạn dịch vụ qua email hoặc bảng điều khiển. Khách hàng vui lòng duy trì đủ số dư tài khoản để dịch vụ không bị gián đoạn.',
          'Sau khi hết hạn quá thời gian ân hạn quy định, máy chủ có thể bị tự động xóa vĩnh viễn khỏi hạ tầng để giải phóng tài nguyên. Dữ liệu sau khi xóa không thể khôi phục.',
        ],
      },
    ],
    footerInfo: 'Hệ Thống Pháp Lý & Điều Khoản 1MCLOUD',
  },
  en: {
    badge: 'Legal & Operations',
    title: '1MCLOUD Terms of Service',
    subtitle:
      'Operational guidelines and policies for 1MCLOUD Infrastructure, High-Performance VPS, and Proxy Services with a focus on compliance, credential security, and fair resource usage.',
    status: {
      scopeLabel: 'Scope',
      scopeValue: 'Cloud / VPS / Proxy',
      formatLabel: 'Format',
      formatValue: 'Policy Document',
      updatedLabel: 'Last Updated',
      updatedValue: '2026',
    },
    nav: {
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
    },
    tocTitle: 'Table of Contents',
    note: {
      title: 'Operational Notice',
      text: 'By creating an account, depositing funds, or launching VPS/proxy instances on 1MCLOUD, you agree to comply with all terms and conditions set forth below. Please read carefully before operating.',
      sourceText: 'Standard Service Guidelines',
    },
    sections: [
      {
        id: 'chap-nhan',
        kicker: '01 / Agreement',
        title: 'Acceptance of Terms',
        content: [
          'By registering, activating, or maintaining any services on 1MCLOUD, you acknowledge that you have read, understood, and agreed to adhere to all terms published at the time of usage.',
          'These terms apply to account owners, technical administrators, and any authorized individuals granted access to your servers, proxies, or network infrastructure.',
        ],
      },
      {
        id: 'su-dung-hop-phap',
        kicker: '02 / Compliance',
        title: 'Lawful Use of Infrastructure',
        content: [
          'Customers are solely responsible for ensuring that virtual servers (VPS), proxy nodes, and network bandwidth are utilized strictly in accordance with applicable laws in Vietnam and datacenter host regions.',
        ],
        bullets: [
          'Do not use services for illegal distribution, copyright infringement, malicious propaganda, or violating third-party rights.',
          'Do not allow third parties to leverage your resources for unauthorized activities or distributing malware.',
          'You are responsible for maintaining complete oversight over your application code, databases, access credentials, and server workloads.',
        ],
      },
      {
        id: 'noi-dung-cam',
        kicker: '03 / Prohibited Use',
        title: 'Prohibited Activities & Zero Tolerance',
        content: [
          '1MCLOUD maintains a zero-tolerance policy against any activities that compromise server stability, network integrity, or internet community security.',
        ],
        grid: [
          {
            title: 'Spam & Bulk Mail',
            desc: 'Sending unsolicited emails, bulk newsletters, or operating open mail relays is strictly prohibited.',
            icon: 'spam',
          },
          {
            title: 'Network Attacks & Malware',
            desc: 'Conducting DDoS/DoS attacks, vulnerability scans, brute-force exploits, or hosting malware.',
            icon: 'attack',
          },
          {
            title: 'Copyright Infringement (DMCA)',
            desc: 'Hosting pirated media, cracked software, phishing portals, or infringing on intellectual property.',
            icon: 'copyright',
          },
          {
            title: 'Abusive Resource Mining',
            desc: 'Unauthorized crypto-mining, severe CPU abuse, or artificial traffic generation causing host degradation.',
            icon: 'mining',
          },
        ],
      },
      {
        id: 'tai-nguyen',
        kicker: '04 / Resource Policy',
        title: 'System Resources & Fair Use Policy',
        content: [
          'Users are allocated resources specified in their plan. Automated telemetry monitors for anomalous 100% CPU lockouts, continuous disk I/O thrashing, or network saturation that risks degrading neighbors on shared hypervisors.',
          'If abusive resource consumption is detected, 1MCLOUD reserves the right to throttle or temporarily pause workloads to protect cluster integrity.',
        ],
      },
      {
        id: 'bao-mat',
        kicker: '05 / Security & Credentials',
        title: 'Account Security & Access Credentials',
        content: [
          'You are responsible for safeguarding your 1MCLOUD account passwords, API tokens, SSH private keys, and root/administrator credentials.',
          'Upon detecting unauthorized access attempts or suspected breaches, immediately update your credentials and notify 1MCLOUD support.',
        ],
      },
      {
        id: 'du-lieu',
        kicker: '06 / Data & Backup',
        title: 'Data Integrity & Backup Responsibility',
        content: [
          '1MCLOUD guarantees hardware resilience and 99.99% network uptime. However, customers remain responsible for creating and retaining off-site backups of their databases, applications, and server states.',
          '1MCLOUD is not liable for data loss resulting from accidental deletion by users, internal application bugs, or unforeseeable force majeure incidents.',
        ],
      },
      {
        id: 'xu-ly-vi-pham',
        kicker: '07 / Enforcement',
        title: 'Suspension & Account Termination',
        content: [
          '1MCLOUD may suspend or terminate service instances immediately without prior warning upon detecting severe malicious activities (e.g., botnet participation, DDoS origins).',
          'For minor or inadvertent issues, clients will be notified with a grace remediation window to resolve the situation.',
        ],
      },
      {
        id: 'gia-han',
        kicker: '08 / Renewal & Expiration',
        title: 'Service Renewal & Deprovisioning',
        content: [
          'Automated renewal notifications are dispatched prior to expiry via email and the dashboard. Ensure your balance is sufficient to prevent operational interruption.',
          'Expired servers that pass the grace period will be permanently deprovisioned and purged to free up hardware allocation. Purged data cannot be recovered.',
        ],
      },
    ],
    footerInfo: '1MCLOUD Legal & Compliance System',
  },
}

export default function TermsOfService() {
  const language = useLanguageStore((state: { language: string }) => state.language) as 'vi' | 'en'
  const d: LegalPageData = termsData[language] || termsData.en

  return (
    <LegalPageLayout
      data={d}
      activeRoute="terms"
      noticeIcon={
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      }
    />
  )
}
