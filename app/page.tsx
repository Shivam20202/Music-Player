import MusicPlayer from "@/components/music-player"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider>
      <MusicPlayer />
    </ThemeProvider>
  )
}

