import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion as M, animate, AnimatePresence } from 'motion/react'
import useLanguageStore from '../store/useLanguageStore'

const privacyData = {
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

/**
 * Get element's scroll target position relative to the scroll container.
 * Uses bounding rects to reliably calculate the exact offset within the container,
 * regardless of intermediate offsetParents.
 */
function getOffsetTop(elem, container) {
  return (
    elem.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop
  )
}

export default function PrivacyPolicy() {
  const language = useLanguageStore((state) => state.language)
  const d = privacyData[language] || privacyData.en
  const [activeSection, setActiveSection] = useState(d.sections[0].id)
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false)

  useEffect(() => {
    const container = document.getElementById('main-scroll-container')
    if (!container) return

    const handleScroll = () => {
      const scrollTop = container.scrollTop
      for (let i = d.sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(d.sections[i].id)
        if (section && getOffsetTop(section, container) <= scrollTop + 160) {
          setActiveSection(d.sections[i].id)
          break
        }
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [d])

  const scrollToSection = (e, id) => {
    e.preventDefault()
    const elem = document.getElementById(id)
    const container = document.getElementById('main-scroll-container')
    if (elem && container) {
      // #main-scroll-container starts directly below Navbar, so its top is already navbar-independent
      const targetTop = getOffsetTop(elem, container)
      animate(container.scrollTop, targetTop, {
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: (latest) => {
          container.scrollTop = latest
        },
      })
      setActiveSection(id)
      setIsMobileTocOpen(false)

      // Highlight the section immediately as scroll starts
      const section = document.getElementById(id)
      if (!section) return
      const h2 = section.querySelector('h2')
      if (h2) {
        animate(
          h2,
          {
            color: ['var(--highlight-text)', 'var(--highlight-text)', 'var(--text-primary)'],
            textShadow: [
              '0 0 24px color-mix(in srgb, var(--primary) 60%, transparent)',
              '0 0 16px color-mix(in srgb, var(--primary) 30%, transparent)',
              '0 0 0px transparent',
            ],
          },
          { duration: 2.4, ease: 'easeOut', times: [0, 0.25, 1] }
        )
      }
      animate(
        section,
        {
          boxShadow: [
            '0 0 25px -5px color-mix(in srgb, var(--primary) 35%, transparent), inset 0 0 15px -3px color-mix(in srgb, var(--primary) 20%, transparent)',
            '0 0 15px -5px color-mix(in srgb, var(--primary) 20%, transparent), inset 0 0 8px -3px color-mix(in srgb, var(--primary) 10%, transparent)',
            '0 0 0px transparent, inset 0 0 0px transparent',
          ],
        },
        { duration: 2.4, ease: 'easeOut', times: [0, 0.3, 1] }
      )
    }
  }

  return (
    <div className="w-full">
      {/* Hero Banner Section */}
      <section className="border-card-border relative overflow-hidden border-b bg-[linear-gradient(to_bottom,var(--home-hero-gradient-from),var(--home-hero-gradient-to))] px-4 py-12 sm:px-6 md:py-16">
        <div className="home-grid-bg absolute inset-0 opacity-20" />

        <div className="relative mx-auto flex max-w-380 flex-col items-center justify-between gap-8 lg:flex-row lg:items-end">
          <M.div
            className="flex flex-1 flex-col gap-4 text-center lg:text-left"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Eyebrow Badge */}
            <div className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 self-center rounded-full border px-3.5 py-1 text-xs font-bold tracking-wider uppercase lg:self-start">
              <span className="relative flex size-2">
                <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                <span className="bg-primary relative inline-flex size-2 rounded-full" />
              </span>
              {d.badge}
            </div>

            {/* Title */}
            <h1 className="text-text-primary text-3xl leading-tight font-black tracking-tight sm:text-4xl md:text-5xl">
              {d.title}
            </h1>

            {/* Subtitle */}
            <p className="text-text-muted max-w-2xl text-base leading-relaxed sm:text-lg">
              {d.subtitle}
            </p>
          </M.div>

          {/* Status Metadata Panel */}
          <M.aside
            className="border-border bg-terminal/80 w-full max-w-sm rounded-xl border p-4 shadow-xl backdrop-blur-md"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="border-border/60 flex items-center justify-between border-b py-2 text-sm">
              <span className="text-text-muted text-xs font-semibold uppercase">
                {d.status.scopeLabel}
              </span>
              <span className="text-text-primary font-mono font-bold">{d.status.scopeValue}</span>
            </div>
            <div className="border-border/60 flex items-center justify-between border-b py-2 text-sm">
              <span className="text-text-muted text-xs font-semibold uppercase">
                {d.status.formatLabel}
              </span>
              <span className="text-text-primary font-mono font-bold">{d.status.formatValue}</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-sm">
              <span className="text-text-muted text-xs font-semibold uppercase">
                {d.status.updatedLabel}
              </span>
              <span className="text-highlight font-mono font-bold">{d.status.updatedValue}</span>
            </div>
          </M.aside>
        </div>
      </section>

      {/* Main Container */}
      <div className="mx-auto max-w-380 px-4 pt-8 sm:px-6 md:pt-12">
        {/* Quick Subnav Switcher */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 md:mb-8">
          <div className="bg-surface border-card-border inline-flex rounded-xl border p-1 shadow-sm">
            <Link
              to="/terms"
              className="text-text-muted hover:text-text-primary rounded-lg px-4 py-2 text-xs font-medium transition-all sm:text-sm"
            >
              {d.nav.terms}
            </Link>
            <Link
              to="/privacy"
              className="bg-blue text-text-secondary rounded-lg px-4 py-2 text-xs font-bold tracking-wide transition-all sm:text-sm"
            >
              {d.nav.privacy}
            </Link>
          </div>
        </div>

        {/* 2-Column Document Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
          {/* Left: Sticky Table of Contents (Desktop) */}
          <aside className="hidden lg:block">
            <div className="border-card-border bg-navbar/90 sticky top-6 rounded-2xl border p-5 shadow-sm backdrop-blur-md">
              <p className="text-primary mb-4 text-xs font-bold tracking-wider uppercase">
                {d.tocTitle}
              </p>
              <nav className="flex flex-col gap-1">
                {d.sections.map((sec) => {
                  const isActive = activeSection === sec.id
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={(e) => scrollToSection(e, sec.id)}
                      className={`flex items-center justify-between rounded-lg border-l-2 px-3 py-2 text-sm transition-all duration-200 ${
                        isActive
                          ? 'border-primary/40 bg-primary/10 text-primary font-bold'
                          : 'text-text-muted hover:bg-bg-hover hover:text-text-primary border-transparent'
                      }`}
                    >
                      <span className="truncate">{sec.title}</span>
                      <span className="font-mono text-[10px] opacity-60">
                        {sec.kicker.split('/')[0]}
                      </span>
                    </a>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Right: Document Content Card */}
          <article className="border-card-border bg-navbar/70 rounded-2xl border p-6 shadow-md backdrop-blur-sm sm:p-10">
            {/* Notice Banner */}
            <div className="border-primary/30 bg-primary/5 mb-10 flex flex-col gap-2 rounded-xl border p-5 sm:flex-row sm:items-start sm:gap-4">
              <div className="bg-primary/20 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
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
              </div>
              <div className="flex-1">
                <strong className="text-text-primary block text-base font-bold">
                  {d.note.title}
                </strong>
                <p className="text-text-muted mt-1 text-sm leading-relaxed">{d.note.text}</p>
              </div>
            </div>

            {/* Sections */}
            <div className="flex flex-col">
              {d.sections.map((sec, index) => (
                <section
                  key={sec.id}
                  id={sec.id}
                  className={`-mx-4 scroll-mt-8 rounded-xl px-4 py-8 transition-colors sm:-mx-6 sm:px-6 ${
                    index !== 0 ? 'border-border/40 border-t' : 'pt-0'
                  }`}
                >
                  <p className="text-primary mb-2 text-xs font-bold tracking-wider uppercase">
                    {sec.kicker}
                  </p>
                  <h2 className="text-text-primary mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
                    {sec.title}
                  </h2>

                  <div className="text-text-muted flex flex-col gap-3 text-base leading-relaxed">
                    {sec.content.map((pText, i) => (
                      <p key={i}>{pText}</p>
                    ))}
                  </div>

                  {/* Bullet points if any */}
                  {sec.bullets && (
                    <ul className="text-text-muted mt-4 flex flex-col gap-2 pl-2">
                      {sec.bullets.map((bText, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="bg-primary mt-2 size-1.5 shrink-0 rounded-full" />
                          <span>{bText}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Clause grid if any */}
                  {sec.grid && (
                    <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {sec.grid.map((card, i) => (
                        <div
                          key={i}
                          className="border-card-border bg-terminal/40 hover:border-primary/50 hover:bg-terminal/70 rounded-xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
                        >
                          <b className="text-primary mb-1.5 flex items-center gap-2 font-bold">
                            <span className="bg-primary size-2 rounded-full" />
                            {card.title}
                          </b>
                          <span className="text-text-muted block text-sm leading-relaxed">
                            {card.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Document Footer */}
            <footer className="border-border/60 text-text-muted mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-xs">
              <span className="text-primary font-semibold">{d.footerInfo}</span>
              <span>© {new Date().getFullYear()} 1MCLOUD. All rights reserved.</span>
            </footer>
          </article>
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) for Table of Contents */}
      <div className="fixed bottom-4 left-4 z-40 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileTocOpen(true)}
          className="bg-blue text-text-secondary rounded-full p-2"
          aria-label="Open Table of Contents"
        >
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
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </button>
      </div>

      {/* Mobile Slide-Up Drawer for Table of Contents */}
      <AnimatePresence>
        {isMobileTocOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
            {/* Backdrop */}
            <M.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileTocOpen(false)}
            />

            {/* Drawer Card */}
            <M.div
              initial={{ y: '100%', opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="border-card-border bg-surface relative z-10 flex max-h-[80vh] w-full max-w-lg flex-col rounded-t-3xl border-t p-6 shadow-2xl"
            >
              {/* Header */}
              <div className="border-border/40 mb-4 flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="bg-primary size-2 rounded-full" />
                  <h3 className="text-primary text-sm font-bold tracking-wider uppercase">
                    {d.tocTitle}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileTocOpen(false)}
                  className="hover:bg-bg-hover text-text-muted hover:text-text-primary rounded-lg p-1.5 transition-colors"
                  aria-label="Close"
                >
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
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* List */}
              <nav className="flex flex-col gap-1.5 overflow-y-auto pr-1 pb-4">
                {d.sections.map((sec) => {
                  const isActive = activeSection === sec.id
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      onClick={(e) => scrollToSection(e, sec.id)}
                      className={`flex items-center justify-between gap-2 rounded-xl border-l-3 px-3.5 py-2.5 text-sm transition-all duration-200 ${
                        isActive
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-sm'
                          : 'text-text-muted hover:bg-bg-hover hover:text-text-primary border-transparent'
                      }`}
                    >
                      <span className="truncate">{sec.title}</span>
                      <span className="font-mono text-xs opacity-60">
                        {sec.kicker.split('/')[0]}
                      </span>
                    </a>
                  )
                })}
              </nav>
            </M.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
