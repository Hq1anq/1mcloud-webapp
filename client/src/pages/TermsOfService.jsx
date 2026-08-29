import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion as M, animate, AnimatePresence } from 'motion/react'
import useLanguageStore from '../store/useLanguageStore'

const termsData = {
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

export default function TermsOfService() {
  const language = useLanguageStore((state) => state.language)
  const d = termsData[language] || termsData.en
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
      <section className="border-card-border relative overflow-hidden border-b bg-[linear-gradient(to_bottom,var(--home-hero-gradient-from),var(--home-hero-gradient-to))] px-4 sm:px-6 md:py-16">
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
              className="bg-blue text-text-secondary rounded-lg px-4 py-2 text-xs font-bold tracking-wide transition-all sm:text-sm"
            >
              {d.nav.terms}
            </Link>
            <Link
              to="/privacy"
              className="text-text-muted hover:text-text-primary rounded-lg px-4 py-2 text-xs font-medium transition-all sm:text-sm"
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
                      className={`flex items-center justify-between gap-1 rounded-lg border-l-2 px-3 py-2 text-sm transition-all duration-200 ${
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
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
