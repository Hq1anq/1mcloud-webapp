import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Custom hook xử lý mượt việc cuộn tự động đến một thẻ HTML khi link có chứa `#` hoặc cuộn lên top
 */
export function useHashScroll() {
  const location = useLocation()

  useEffect(() => {
    let cancelScroll = false // Cờ theo dõi component có bị unmount chưa

    const scrollWithRetry = (attempts = 10) => {
      // Chống rò rỉ bộ nhớ (memory leak): Nếu component trang này đã bị xóa (unmount) thì dừng ngay!
      if (cancelScroll) return

      if (location.hash) {
        const id = location.hash.substring(1) // Cắt bỏ kí hiệu '#' lấy id
        const element = document.getElementById(id) // Dùng ID thuần vẫn rất ổn với hash routing

        if (element) {
          // Thành công: Tìm thấy thẻ HTML và cuộn
          element.scrollIntoView({ behavior: 'smooth' })
        } else if (attempts > 0) {
          // Chưa render kịp: Nhờ trình duyệt tìm lại ở khung hình tiếp theo
          // requestAnimationFrame tối ưu và ít tiêu tốn tài nguyên hơn setTimeout
          requestAnimationFrame(() => scrollWithRetry(attempts - 1))
        }
      } else {
        const scrollContainer = document.getElementById('main-scroll-container')
        if (scrollContainer) {
          scrollContainer.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }
    }

    // Chạy thử luôn khi đường dẫn web (kể cả hash) thay đổi
    scrollWithRetry()

    // Cleanup rất quan trọng khi dùng useEffect có async/vòng lặp giúp ngăn rò bộ nhớ
    return () => {
      cancelScroll = true // Báo hiệu đã chuyển trang/unmount
    }
  }, [location.pathname, location.hash])
}
