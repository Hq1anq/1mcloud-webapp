import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <div class="text-text-muted border-text-muted mt-16 w-full border-t px-4 pt-12">
      <div class="mx-auto flex max-w-[1280px] flex-wrap gap-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" className="size-12">
              <path
                fill="var(--logo-ring)"
                d="M512,95A417.14,417.14,0,0,1,674.29,896.27,417.14,417.14,0,0,1,349.71,127.73,414.29,414.29,0,0,1,512,95m0-95C229.23,0,0,229.23,0,512s229.23,512,512,512,512-229.23,512-512S794.77,0,512,0Z"
              />
              <polygon
                fill="var(--logo-inner)"
                points="278.19 279.12 204.29 369.27 204.29 416.09 254.9 416.09 254.9 745.08 362.99 745.08 362.99 279.12 278.19 279.12"
              />
              <path
                fill="var(--logo-inner)"
                d="M819.7,443.62c-.9-90.84-75.12-164.24-166.74-164.69a166,166,0,0,0-115.89,47.65,175.87,175.87,0,0,0-119.31-47.64l-1.06,0a116.39,116.39,0,0,0-34.61,5.28V397.11h0a52.2,52.2,0,0,1,38-16.73,64.38,64.38,0,0,1,16.37,2.31A62.84,62.84,0,0,1,469,404.09l.16.2a52.23,52.23,0,0,1,10.93,32.34V745H588.19V442.25a58,58,0,0,1,12.92-36.44,64.34,64.34,0,0,1,99.42,0l.16.19a51.38,51.38,0,0,1,10.94,32V745H819.71V443.62Z"
              />
            </svg>
            <h1 className="text-3xl font-semibold">1mcloud</h1>
          </div>
          <div className="max-w-lg">
            Cung cấp giải pháp hạ tầng linh hoạt, bảo mật với toàn quyền quản trị và kết nối tốc độ
            cao toàn cầu.
          </div>
        </div>
        <div class="m-auto flex flex-wrap gap-20">
          <div class="flex flex-col gap-4">
            <h4 class="text-text-primary font-bold">Dịch vụ</h4>
            <Link to="/#vps" className="social-link cursor-pointer">
              VPS
            </Link>
            <Link to="/#vps" className="social-link cursor-pointer">
              VPS GPU
            </Link>
            <Link to="/#proxy" className="social-link cursor-pointer">
              Proxy dân cư
            </Link>
            <Link to="/#proxy" className="social-link cursor-pointer">
              Proxy Datacenter
            </Link>
          </div>
          <div class="flex flex-col gap-4">
            <h4 class="text-text-primary font-bold">Thông tin</h4>
            <Link to="/#hero" className="social-link cursor-pointer">
              Về chúng tôi
            </Link>
            <a href="/contact" className="social-link cursor-pointer">
              Liên hệ
            </a>
            <a href="/terms" className="social-link cursor-pointer">
              Điều khoản sử dụng
            </a>
            <a href="/privacy" className="social-link cursor-pointer">
              Chính sách bảo mật
            </a>
          </div>
        </div>
      </div>
      <div class="border-text-muted mx-auto mt-12 max-w-[1280px] border-t text-center">
        © 2023 1mcloud. Bảo lưu mọi quyền.
      </div>
    </div>
  )
}
