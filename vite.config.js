import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import zlib from 'zlib'
import { readFile, writeFile, readdir, stat } from 'fs/promises'
import { join } from 'path'
import { promisify } from 'util'

const gzip = promisify(zlib.gzip)
const brotliCompress = promisify(zlib.brotliCompress)

/** Compress all eligible files in a directory (non-recursive helper) */
async function compressDir(dir) {
  let entries
  try { entries = await readdir(dir) } catch { return }
  await Promise.all(entries.map(async (name) => {
    // skip already-compressed files and fonts/images
    if (/\.(gz|br|ttf|woff2?|webp|png|jpg|svg)$/.test(name)) return
    const filePath = join(dir, name)
    const info = await stat(filePath).catch(() => null)
    if (!info?.isFile()) return
    const content = await readFile(filePath)
    const [gz, br] = await Promise.all([gzip(content), brotliCompress(content)])
    if (gz.length < content.length) await writeFile(filePath + '.gz', gz)
    if (br.length < content.length) await writeFile(filePath + '.br', br)
  }))
}

function compressPlugin() {
  return {
    name: 'compress-assets',
    apply: 'build',
    enforce: 'post',
    async closeBundle() {
      await Promise.all([
        compressDir('dist'),
        compressDir('dist/assets'),
      ])
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    compressPlugin(),
  ],

  build: {
    // warn if chunk > 1MB
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Split vendor libs into separate chunks
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@tiptap')) return 'tiptap';
            if (id.includes('react-router')) return 'router';
            return 'vendor';
          }
        },
      },
    },
  },

  server: {
    host: true,
    port: 9005,
  },

  preview: {
    host: true,
    port: 9005,
  },
})
