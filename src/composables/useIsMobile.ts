// モバイル(タブレット・スマホ)端末かパソコン化をUAで判別
import { ref } from 'vue'

function detectMobile(): boolean {
  const ua = navigator.userAgent
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return true
  }
  // iPadOS 13以降はMac版SafariのUAを送るため、タッチ対応で補完
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 0) {
    return true
  }
  return false
}

export function useIsMobile() {
  return ref(detectMobile())
}
