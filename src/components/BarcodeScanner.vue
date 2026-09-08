<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { NotFoundException } from '@zxing/library'

const emit = defineEmits<{
  scanned: [isbn: string]
  error: [message: string]
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const isScanning = ref(false)
const statusMessage = ref('')

let codeReader: BrowserMultiFormatReader | null = null
let controls: { stop: () => void } | null = null

async function startScan() {
  if (isScanning.value) return
  isScanning.value = true
  statusMessage.value = 'カメラを起動中...'

  try {
    codeReader = new BrowserMultiFormatReader()
    const devices = await BrowserMultiFormatReader.listVideoInputDevices()

    if (devices.length === 0) {
      throw new Error('カメラが見つかりませんでした')
    }

    // 背面カメラを優先
    const backCamera = devices.find((d) => /back|rear|environment/i.test(d.label)) ?? devices[0]!
    statusMessage.value = 'バーコードにカメラを向けてください'

    controls = await codeReader.decodeFromVideoDevice(
      backCamera.deviceId,
      videoRef.value!,
      (result, error) => {
        if (result) {
          const text = result.getText()
          // EAN-13（ISBNは978/979始まり）のみ受け付ける
          if (/^97[89]\d{10}$/.test(text)) {
            stopScan()
            emit('scanned', text)
          }
        }
        if (error && !(error instanceof NotFoundException)) {
          console.warn('スキャンエラー:', error)
        }
      },
    )
  } catch (err) {
    isScanning.value = false
    statusMessage.value = ''
    const message = err instanceof Error ? err.message : 'カメラの起動に失敗しました'
    emit('error', message)
  }
}

function stopScan() {
  controls?.stop()
  controls = null
  codeReader = null
  isScanning.value = false
  statusMessage.value = ''
}

onUnmounted(() => {
  stopScan()
})
</script>

<template>
  <div class="scanner">
    <div v-if="isScanning" class="video-wrapper">
      <video ref="videoRef" class="video" autoplay muted playsinline />
      <div class="scan-overlay">
        <div class="scan-frame" />
      </div>
      <p class="status-message">{{ statusMessage }}</p>
      <button class="btn btn-secondary" @click="stopScan">スキャン停止</button>
    </div>
    <button v-else class="btn btn-primary" @click="startScan">
      <span class="icon">📷</span> バーコードをスキャン
    </button>
  </div>
</template>

<style scoped>
.scanner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.video-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.video {
  width: 100%;
  border-radius: 8px;
  background: #000;
}

.scan-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.scan-frame {
  width: 70%;
  height: 120px;
  border: 3px solid rgba(99, 179, 237, 0.9);
  border-radius: 8px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4);
}

.status-message {
  font-size: 0.875rem;
  color: #4a5568;
  margin: 0;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #3182ce;
  color: white;
}

.btn-primary:hover {
  background-color: #2b6cb0;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #2d3748;
}

.btn-secondary:hover {
  background-color: #cbd5e0;
}

.icon {
  font-size: 1.1rem;
}
</style>
