import useLanguageStore from '../store/useLanguageStore'
import LegalPageLayout from '../components/layout/LegalPageLayout'
import type { LegalPageData } from '../types/legal'

const privacyData: Record<'vi' | 'en', LegalPageData> = {
  vi: {
    badge: 'Bảo Mật & Quyền Riêng Tư',
    title: 'Chính Sách Bảo Mật 1MCLOUD',
    subtitle:
      'Cách 1MCLOUD thu thập, lưu trữ, sử dụng và bảo vệ thông tin khách hàng, phân tách rõ ràng giữa thông tin định danh tài khoản và dữ liệu tự vận hành trên hạ tầng.',
    status: {
      scopeLabel: 'Dữ liệu áp dụng',
      scopeValue: 'Account / Service',
      formatLabel: 'Loại văn bản',
      formatValue: 'Privacy Policy',
      updatedLabel: 'Cập nhật gần nhất',
      updatedValue: '2026',
    },
    nav: {
      terms: 'Điều khoản dịch vụ',
      privacy: 'Chính sách bảo mật',
    },
    tocTitle: 'Mục Lục',
    note: {
      title: 'Cam kết bảo mật thông tin',
      text: '1MCLOUD tôn trọng quyền riêng tư và cam kết bảo vệ dữ liệu cá nhân của người dùng bằng các giải pháp mã hóa và tiêu chuẩn kỹ thuật an toàn.',
      sourceText: 'Tài liệu tiêu chuẩn bảo mật',
    },
    sections: [
      {
        id: 'thong-tin-khach-hang',
        kicker: '01 / Customer Info',
        title: 'Thông tin khách hàng',
        content: [
          'Thông tin khách hàng bao gồm tên tài khoản, địa chỉ email, số điện thoại liên hệ, lịch sử giao dịch và các thông tin định danh cần thiết do khách hàng chủ động cung cấp khi đăng ký dịch vụ trên 1MCLOUD.',
          'Thông tin khách hàng không bao gồm mã nguồn phần mềm, cơ sở dữ liệu, file cấu hình, proxy session hoặc dữ liệu bí mật mà khách hàng tự triển khai và lưu trữ trên các máy chủ ảo (VPS).',
        ],
      },
      {
        id: 'du-lieu-khach-hang',
        kicker: '02 / Customer Data',
        title: 'Dữ liệu vận hành trên hạ tầng',
        content: [
          'Dữ liệu khách hàng là toàn bộ tài nguyên do khách hàng tải lên, cài đặt, tạo mới hoặc lưu trữ trực tiếp trên hạ tầng của 1MCLOUD (bao gồm website, database, script automation, log hệ thống).',
          'Khách hàng sở hữu toàn quyền và chịu trách nhiệm bảo mật đối với dữ liệu của mình. 1MCLOUD cam kết không xem, sao chép hoặc can thiệp vào dữ liệu máy chủ nếu không có sự đồng ý hoặc yêu cầu hỗ trợ kỹ thuật từ khách hàng.',
        ],
      },
      {
        id: 'thu-thap',
        kicker: '03 / Collection',
        title: 'Thu thập thông tin',
        content: [
          'Người dùng có thể truy cập website 1MCLOUD để tham khảo bảng giá và thông tin kỹ thuật mà không bắt buộc phải cung cấp thông tin cá nhân. Việc thu thập thông tin chỉ diễn ra khi bạn tạo tài khoản hoặc khởi tạo dịch vụ.',
        ],
        bullets: [
          'Hệ thống sử dụng Cookie và LocalStorage để duy trì phiên đăng nhập, tùy chọn giao diện (Dark/Light mode) và ngôn ngữ.',
          'Hệ thống có thể tự động ghi nhận nhật ký truy cập (địa chỉ IP, trình duyệt, thời gian đăng nhập) nhằm mục đích bảo vệ an toàn tài khoản và ngăn chặn gian lận.',
          '1MCLOUD không thu thập bất kỳ dữ liệu nhạy cảm nào ngoài phạm vi cần thiết để cung cấp dịch vụ.',
        ],
      },
      {
        id: 'luu-tru',
        kicker: '04 / Retention',
        title: 'Lưu trữ thông tin và thời hạn',
        content: [
          'Thông tin tài khoản và lịch sử giao dịch được lưu trữ an toàn trong suốt thời gian khách hàng duy trì tài khoản trên hệ thống.',
          'Khi khách hàng chủ động yêu cầu xóa tài khoản hoặc chấm dứt hoàn toàn dịch vụ, thông tin cá nhân sẽ được xóa hoặc ẩn danh theo quy trình tiêu chuẩn, ngoại trừ các dữ liệu giao dịch cần lưu trữ theo quy định kế toán hoặc pháp luật.',
        ],
      },
      {
        id: 'su-dung',
        kicker: '05 / Purpose of Use',
        title: 'Mục đích sử dụng thông tin',
        content: ['1MCLOUD sử dụng thông tin đã thu thập cho các mục đích vận hành cốt lõi sau:'],
        grid: [
          {
            title: 'Kích Hoạt Dịch Vụ',
            desc: 'Tự động tạo VPS, cấp phát IP Proxy và quản lý tài nguyên máy chủ theo gói đã đăng ký.',
          },
          {
            title: 'Quản Lý Tài Khoản',
            desc: 'Xác thực đăng nhập, kiểm tra số dư, quản lý nạp tiền và bảo vệ bảo mật tài khoản.',
          },
          {
            title: 'Hỗ Trợ Kỹ Thuật 24/7',
            desc: 'Tiếp nhận ticket, xử lý sự cố kết nối và phản hồi các yêu cầu từ khách hàng qua Telegram/Zalo.',
          },
          {
            title: 'Thông Báo Hệ Thống',
            desc: 'Gửi email nhắc gia hạn, thông báo lịch bảo trì hạ tầng hoặc nâng cấp tính năng mới.',
          },
        ],
      },
      {
        id: 'truy-cap-va-chia-se',
        kicker: '06 / Data Access',
        title: 'Truy cập và chia sẻ dữ liệu',
        content: [
          '1MCLOUD cam kết tuyệt đối không bán, trao đổi hoặc chia sẻ thông tin cá nhân của khách hàng cho bất kỳ bên thứ ba nào vì mục đích thương mại hoặc quảng cáo.',
          'Thông tin chỉ được chia sẻ trong trường hợp bất khả kháng khi có yêu cầu bằng văn bản hợp lệ từ cơ quan pháp luật có thẩm quyền theo quy định hiện hành.',
        ],
      },
      {
        id: 'bao-ve-an-toan',
        kicker: '07 / Security Standards',
        title: 'Biện pháp bảo vệ an toàn thông tin',
        content: ['Chúng tôi áp dụng các tiêu chuẩn bảo mật hiện đại nhằm bảo vệ hệ thống:'],
        bullets: [
          'Toàn bộ kết nối giữa trình duyệt và máy chủ được mã hóa qua giao thức SSL/TLS (HTTPS).',
          'Mật khẩu tài khoản được mã hóa một chiều bằng thuật toán hash an toàn trước khi lưu vào cơ sở dữ liệu.',
          'Hạ tầng mạng được trang bị tường lửa (Firewall) đa tầng và hệ thống phòng chống xâm nhập.',
        ],
      },
      {
        id: 'quyen-khach-hang',
        kicker: '08 / User Rights',
        title: 'Quyền của khách hàng đối với thông tin',
        content: [
          'Khách hàng có quyền truy cập, kiểm tra, cập nhật hoặc điều chỉnh thông tin cá nhân bất kỳ lúc nào thông qua bảng điều khiển tài khoản.',
          'Bạn có thể yêu cầu xóa tài khoản hoặc xuất dữ liệu lịch sử bằng cách gửi yêu cầu tới đội ngũ hỗ trợ của 1MCLOUD.',
        ],
      },
      {
        id: 'thay-doi-chinh-sach',
        kicker: '09 / Policy Updates',
        title: 'Cập nhật chính sách bảo mật',
        content: [
          '1MCLOUD có thể cập nhật chính sách này định kỳ để phản ánh những thay đổi trong quy trình vận hành hoặc quy định pháp luật. Khi có thay đổi trọng yếu, chúng tôi sẽ thông báo rõ ràng trên website hoặc gửi thông báo trực tiếp qua email.',
        ],
      },
    ],
    footerInfo: 'Hệ Thống Bảo Mật 1MCLOUD',
  },
  en: {
    badge: 'Security & Privacy',
    title: '1MCLOUD Privacy Policy',
    subtitle:
      'How 1MCLOUD collects, retains, utilizes, and protects customer information, maintaining a strict distinction between account identity details and self-managed cloud workloads.',
    status: {
      scopeLabel: 'Applicable Data',
      scopeValue: 'Account / Service',
      formatLabel: 'Document Type',
      formatValue: 'Privacy Policy',
      updatedLabel: 'Last Updated',
      updatedValue: '2026',
    },
    nav: {
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
    },
    tocTitle: 'Table of Contents',
    note: {
      title: 'Data Privacy Commitment',
      text: '1MCLOUD respects your privacy and is committed to protecting personal data through strong encryption standards and industry-grade cybersecurity measures.',
      sourceText: 'Standard Security Framework',
    },
    sections: [
      {
        id: 'thong-tin-khach-hang',
        kicker: '01 / Customer Info',
        title: 'Customer Information',
        content: [
          'Customer Information includes account names, email addresses, contact phone numbers, billing transaction records, and identification details provided during registration on 1MCLOUD.',
          'Customer Information does not include application source code, databases, configuration files, proxy logs, or confidential data hosted independently on customer virtual servers (VPS).',
        ],
      },
      {
        id: 'du-lieu-khach-hang',
        kicker: '02 / Customer Data',
        title: 'Hosted Workload Data',
        content: [
          'Customer Data encompasses all content, operating system images, scripts, databases, and files created or hosted directly on 1MCLOUD hardware.',
          'Customers retain full ownership and governance over their hosted data. 1MCLOUD will never inspect, copy, or disclose customer server contents unless explicitly authorized for troubleshooting.',
        ],
      },
      {
        id: 'thu-thap',
        kicker: '03 / Collection',
        title: 'Information Collection',
        content: [
          'You may browse the 1MCLOUD website and pricing plans anonymously without providing personal credentials. Collection occurs upon registration or service provisioning.',
        ],
        bullets: [
          'We use Cookies and LocalStorage to preserve user sessions, visual theme preferences (Dark/Light), and language settings.',
          'Network telemetry logs (IP addresses, user agents, login timestamps) are recorded to prevent fraudulent activities and safeguard account security.',
          'No extraneous sensitive personal data is collected beyond what is strictly required to deliver cloud services.',
        ],
      },
      {
        id: 'luu-tru',
        kicker: '04 / Retention',
        title: 'Data Storage & Retention',
        content: [
          'Account credentials and billing history are stored securely as long as your account remains active on the 1MCLOUD platform.',
          'Upon an account deletion request or service termination, personal identifying data is securely expunged or anonymized in accordance with accounting and statutory guidelines.',
        ],
      },
      {
        id: 'su-dung',
        kicker: '05 / Purpose of Use',
        title: 'Purpose of Information Processing',
        content: [
          '1MCLOUD utilizes gathered information strictly for the following core operations:',
        ],
        grid: [
          {
            title: 'Service Provisioning',
            desc: 'Automating VPS deployment, assigning dedicated Proxy IPs, and managing hardware resources.',
          },
          {
            title: 'Account Administration',
            desc: 'Authenticating logins, tracking balance deposits, and preventing credential stuffing.',
          },
          {
            title: 'Technical Support 24/7',
            desc: 'Handling technical tickets, resolving connectivity diagnostics, and live chat assistance.',
          },
          {
            title: 'System Alerts',
            desc: 'Dispatching service renewal reminders, scheduled maintenance windows, and security notices.',
          },
        ],
      },
      {
        id: 'truy-cap-va-chia-se',
        kicker: '06 / Data Access',
        title: 'Data Access & Third-Party Disclosure',
        content: [
          '1MCLOUD does not sell, lease, or rent customer personal details to third parties for marketing or advertising purposes under any circumstances.',
          'Data disclosure only occurs when mandated by lawful court orders or authorized government requests in accordance with prevailing jurisdiction.',
        ],
      },
      {
        id: 'bao-ve-an-toan',
        kicker: '07 / Security Standards',
        title: 'Information Security Controls',
        content: [
          'We implement state-of-the-art security mechanisms to protect platform integrity:',
        ],
        bullets: [
          'All transit data is encrypted via modern TLS/SSL (HTTPS) cryptographic protocols.',
          'User passwords are cryptographically salted and hashed before database persistence.',
          'Datacenter infrastructure is shielded by multi-layered DDoS mitigation and intrusion detection systems.',
        ],
      },
      {
        id: 'quyen-khach-hang',
        kicker: '08 / User Rights',
        title: 'Customer Data Rights',
        content: [
          'You hold the right to access, inspect, rectify, or modify your personal contact information at any time via the account settings console.',
          'You may request account deactivation or data export by submitting a support ticket.',
        ],
      },
      {
        id: 'thay-doi-chinh-sach',
        kicker: '09 / Policy Updates',
        title: 'Policy Modifications',
        content: [
          '1MCLOUD may periodically amend this Privacy Policy to reflect technical or regulatory developments. Significant revisions will be prominently displayed on the website or communicated via email.',
        ],
      },
    ],
    footerInfo: '1MCLOUD Privacy & Security System',
  },
}

export default function PrivacyPolicy() {
  const language = useLanguageStore((state: { language: string }) => state.language) as 'vi' | 'en'
  const d: LegalPageData = privacyData[language] || privacyData.en

  return (
    <LegalPageLayout
      data={d}
      activeRoute="privacy"
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
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      }
    />
  )
}
