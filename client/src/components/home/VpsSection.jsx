export default function VpsSection() {
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 8L12 4L20 8L12 12L4 8Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M4 12L12 16L20 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M4 16L12 20L20 16"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      ),
      title: 'Đa dạng cấu hình',
      desc: 'Tùy chọn từ 1 đến 32 vCPU phù hợp mọi quy mô dự án.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor">
          <path d="M120-80v-280h120v-160h200v-80H320v-280h320v280H520v80h200v160h120v280H520v-280h120v-80H320v80h120v280H120Zm280-600h160v-120H400v120ZM200-160h160v-120H200v120Zm400 0h160v-120H600v120ZM480-680ZM360-280Zm240 0Z" />
        </svg>
      ),
      title: 'IPv4 chuyên dụng',
      desc: 'Địa chỉ IP tĩnh riêng biệt, sạch sẽ, độ tin cậy cao.',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor">
          <path d="M160 96C124.7 96 96 124.7 96 160L96 480C96 515.3 124.7 544 160 544L480 544C515.3 544 544 515.3 544 480L544 237.3C544 220.3 537.3 204 525.3 192L448 114.7C436 102.7 419.7 96 402.7 96L160 96zM192 192C192 174.3 206.3 160 224 160L384 160C401.7 160 416 174.3 416 192L416 256C416 273.7 401.7 288 384 288L224 288C206.3 288 192 273.7 192 256L192 192zM320 352C355.3 352 384 380.7 384 416C384 451.3 355.3 480 320 480C284.7 480 256 451.3 256 416C256 380.7 284.7 352 320 352z" />
        </svg>
      ),
      title: 'Tích hợp Snapshot',
      desc: 'Sao lưu tự động và khôi phục dữ liệu tức thì.',
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          fill="currentColor"
          className="size-6"
        >
          <path d="M505.098 19.25C503.973 13.875 498.098 8 492.723 6.875C460.6 0 435.476 0 410.353 0C307.233 0 245.237 55.25 199.114 128H94.87C78.621 128 59.247 139.875 51.997 154.5L2.625 253.25C1 256.625 0.25 260.25 0 264C0.125 277.25 10.749 288 24.124 288H127.993C180.99 288 223.988 331 223.988 384V488C223.988 501.25 234.737 512 247.987 512C251.736 511.875 255.361 511 258.736 509.5L357.481 460.125C371.98 452.75 383.979 433.5 383.979 417.25V312.75C456.475 266.5 511.972 204.375 511.972 101.75C512.097 76.5 512.097 51.375 505.098 19.25ZM383.979 168C361.98 168 343.981 150.125 343.981 128C344.106 105.875 361.98 88 384.104 88C406.103 88 423.977 105.875 423.977 128S406.103 168 383.979 168ZM35.623 352.125C9.874 377.875 -3 442.625 0.625 511.375C69.746 515 134.243 502 159.991 476.25C200.239 436 202.864 382.375 166.241 345.75C129.618 309.25 75.996 311.75 35.623 352.125ZM117.369 436.125C108.744 444.625 87.245 449 64.247 447.75C62.997 424.875 67.246 403.25 75.871 394.75C89.37 381.25 107.244 380.375 119.369 392.625C131.618 404.75 130.743 422.625 117.369 436.125Z" />
        </svg>
      ),
      title: 'Triển khai tức thì',
      desc: 'Hệ thống tự động cài đặt OS trong vòng 60 giây.',
    },
  ]

  const specCards = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor">
          <path d="M360-360v-240h240v240H360Zm80-80h80v-80h-80v80Zm-80 320v-80h-80q-33 0-56.5-23.5T200-280v-80h-80v-80h80v-80h-80v-80h80v-80q0-33 23.5-56.5T280-760h80v-80h80v80h80v-80h80v80h80q33 0 56.5 23.5T760-680v80h80v80h-80v80h80v80h-80v80q0 33-23.5 56.5T680-200h-80v80h-80v-80h-80v80h-80Zm320-160v-400H280v400h400ZM480-480Z" />
        </svg>
      ),
      iconColor: '#3b82f6',
      iconBg: 'rgba(59,130,246,0.15)',
      title: 'Intel Xeon Gold & AMD EPYC',
      desc: 'Intel Xeon E5-2696 v4, 2680, 2673, Xeon Gold 6133 và tùy chọn NVMe kết hợp CPU AMD mạnh mẽ.',
      statLabel: 'Số nhân',
      statValue: 'Lên tới 64 Cores',
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor">
          <path d="m680-240-56-56 182-184-182-184 56-56 240 240-240 240Zm-400 0L40-480l240-240 56 56-182 184 182 184-56 56Zm11.5-211.5Q280-463 280-480t11.5-28.5Q303-520 320-520t28.5 11.5Q360-497 360-480t-11.5 28.5Q337-440 320-440t-28.5-11.5Zm160 0Q440-463 440-480t11.5-28.5Q463-520 480-520t28.5 11.5Q520-497 520-480t-11.5 28.5Q497-440 480-440t-28.5-11.5Zm160 0Q600-463 600-480t11.5-28.5Q623-520 640-520t28.5 11.5Q680-497 680-480t-11.5 28.5Q657-440 640-440t-28.5-11.5Z" />
        </svg>
      ),
      iconColor: '#a855f7',
      iconBg: 'rgba(168,85,247,0.15)',
      title: '10 Gbps Uplink Network',
      desc: 'Hạ tầng mạng Tier-3 với đường truyền quốc tế riêng biệt. Cam kết băng thông và tốc độ đúng như gói cước.',
      statLabel: 'Băng thông',
      statValue: 'Không giới hạn',
    },
  ]

  const bars = [
    {
      label: 'vCPU Usage',
      value: '24%',
      color: 'from-green-500 to-green-400',
      valueColor: 'text-green-400',
      animClass: 'home-bar-cpu',
    },
    {
      label: 'RAM Allocation',
      value: '12GB / 32GB',
      color: 'from-blue-600 to-blue-400',
      valueColor: 'text-blue-400',
      animClass: 'home-bar-ram',
    },
    {
      label: 'NVMe I/O',
      value: '4500 MB/s',
      color: 'from-purple-600 to-purple-400',
      valueColor: 'text-purple-400',
      animClass: 'home-bar-nvme',
    },
  ]

  return (
    <section className="text-text-muted bg-home-section-alt border-card-border flex w-full justify-center overflow-hidden border-t border-b px-4 py-16">
      <div className="flex max-w-[1280px] flex-1 flex-col">
        <div className="flex flex-col items-center gap-12 lg:flex-row">
          {/*  Left: Monitoring Panel + Spec Cards  */}
          <div className="home-animate-slide-left order-2 w-full flex-1 lg:order-1">
            {/* Resource monitor */}
            <div className="border-border bg-terminal relative flex flex-col justify-center overflow-hidden rounded-xl border px-8 py-12 shadow-xl sm:p-16">
              <div className="home-grid-bg absolute inset-0 opacity-20" />

              {/* macOS-style window dots */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <div className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <div className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>

              <h3 className="z-10 mb-4 text-sm font-bold tracking-widest uppercase sm:mb-6">
                Giám sát tài nguyên
              </h3>

              <div className="z-10 mx-auto w-full max-w-md space-y-4 sm:space-y-6">
                {bars.map((bar) => (
                  <div key={bar.label}>
                    <div className="mb-2 flex justify-between font-mono text-xs sm:text-sm">
                      <span>{bar.label}</span>
                      <span className={bar.valueColor}>{bar.value}</span>
                    </div>
                    <div
                      className="bg-scrollbar-track h-3 w-full overflow-hidden rounded-full"
                      style={{
                        background: 'color-mix(in srgb, var(--color-terminal) 80%, var(--border))',
                      }}
                    >
                      <div
                        className={`h-full rounded-full bg-linear-to-r ${bar.color} ${bar.animClass}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/*  Right: Description + Features  */}
          <div className="home-animate-fade-up order-1 flex flex-1 flex-col gap-8 lg:order-2">
            <div className="flex flex-col gap-4">
              <div className="text-text-title flex items-center gap-2 font-bold tracking-wider uppercase">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  className="size-8 fill-current"
                >
                  <path d="M360-360v-240h240v240H360Zm80-80h80v-80h-80v80Zm-80 320v-80h-80q-33 0-56.5-23.5T200-280v-80h-80v-80h80v-80h-80v-80h80v-80q0-33 23.5-56.5T280-760h80v-80h80v80h80v-80h80v80h80q33 0 56.5 23.5T760-680v80h80v80h-80v80h80v80h-80v80q0 33-23.5 56.5T680-200h-80v80h-80v-80h-80v80h-80Zm320-160v-400H280v400h400ZM480-480Z" />
                </svg>
                VPS Hiệu Năng Cao
              </div>
              <h2 className="text-text-primary text-3xl leading-tight font-bold md:text-4xl">
                Tối ưu hóa vận hành với máy chủ ảo chuyên nghiệp
              </h2>
              <p className="leading-relaxed">
                Tận dụng sức mạnh xử lý vượt trội với cấu hình linh hoạt. Hạ tầng ảo hóa KVM tiên
                tiến đảm bảo tài nguyên độc lập và hiệu suất ổn định.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {features.map((feat) => (
                <div key={feat.title} className="home-animate-fade-up-delay-1 flex gap-4">
                  <div className="bg-home-card-icon-bg text-primary home-icon-hover flex h-12 w-12 shrink-0 items-center justify-center rounded-lg p-2">
                    {feat.icon}
                  </div>
                  <div>
                    <h3 className="text-text-primary text-lg font-bold">{feat.title}</h3>
                    <p className="mt-1 text-sm">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Spec cards grid */}
        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
          {specCards.map((card) => (
            <div
              key={card.title}
              className="border-card-border bg-navbar home-card-hover relative flex flex-col overflow-hidden rounded-2xl border p-6 text-left shadow-sm"
            >
              {/* Background icon */}
              <div className="text-text-primary home-largeicon-hover absolute top-0 right-0 size-35 p-4 opacity-10">
                {card.icon}
              </div>

              <div
                className="home-icon-hover mb-4 flex size-10 items-center justify-center rounded-lg p-1"
                style={{ background: card.iconBg, color: card.iconColor }}
              >
                {card.icon}
              </div>

              <h3 className="text-text-primary mb-2 text-xl font-bold">{card.title}</h3>
              <p className="mb-4">{card.desc}</p>

              <div className="border-card-border mt-auto flex items-center justify-between border-t pt-4 text-base">
                <span>{card.statLabel}</span>
                <span className="text-text-primary font-mono font-bold">{card.statValue}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
