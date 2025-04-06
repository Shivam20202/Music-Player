"use client"

import { useEffect, useRef, useState } from "react"
import { Music, Search, MoreHorizontal, Play, Pause, SkipBack, SkipForward, Volume2, Menu } from "lucide-react"
import Image from "next/image"
import { musicData } from "@/lib/data"
import Sidebar from "./sidebar"
import SongList from "./song-list"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Heart } from "lucide-react"


export type Song = {
  id: string
  title: string
  thumbnail: string
  musicUrl: string
  duration: string
  artistName: string
  color?: string

}

export default function MusicPlayer() {

  const [songs, setSongs] = useState<Song[]>(musicData)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [favorites, setFavorites] = useState<Song[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("forYou")
  const [showSidebar, setShowSidebar] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")
  const [isMuted, setIsMuted] = useState(false)


  // Load favorites from localStorage
  useEffect(() => {
    const storedFavorites = localStorage.getItem("favorites")
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    }

    const storedRecentlyPlayed = sessionStorage.getItem("recentlyPlayed")
    if (storedRecentlyPlayed) {
      setRecentlyPlayed(JSON.parse(storedRecentlyPlayed))
    }

    // Set initial song
    if (musicData.length > 0 && !currentSong) {
      setCurrentSong(musicData[0])
    }
  }, [])

  // Save favorites to localStorage when updated
  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem("favorites", JSON.stringify(favorites))
    }
  }, [favorites])

  // Save recently played to sessionStorage
  useEffect(() => {
    if (recentlyPlayed.length > 0) {
      sessionStorage.setItem("recentlyPlayed", JSON.stringify(recentlyPlayed))
    }
  }, [recentlyPlayed])

  // Handle audio playback
  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Playback failed:", error)
        setIsPlaying(false)
      })
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, currentSong])

  // Update progress
  useEffect(() => {
    if (!audioRef.current) return

    const updateProgress = () => {
      if (audioRef.current) {
        const value = (audioRef.current.currentTime / audioRef.current.duration) * 100
        setProgress(isNaN(value) ? 0 : value)
      }
    }

    audioRef.current.addEventListener("timeupdate", updateProgress)
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", updateProgress)
      }
    }
  }, [currentSong])

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Handle song ended
  useEffect(() => {
    if (!audioRef.current) return

    const handleEnded = () => {
      const currentIndex = songs.findIndex((song) => song.id === currentSong?.id)
      if (currentIndex < songs.length - 1) {
        playSong(songs[currentIndex + 1])
      } else {
        setIsPlaying(false)
      }
    }

    audioRef.current.addEventListener("ended", handleEnded)
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("ended", handleEnded)
      }
    }
  }, [currentSong, songs])

  // Filter songs based on search term
  const filteredSongs = songs.filter((song) => song.title.toLowerCase().includes(searchTerm.toLowerCase()))

  // Play a song
  const playSong = (song: Song) => {
    // Add to recently played
    const newRecentlyPlayed = [song, ...recentlyPlayed.filter((s) => s.id !== song.id)].slice(0, 10)
    setRecentlyPlayed(newRecentlyPlayed)

    setCurrentSong(song)
    setIsPlaying(true)
  }

  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  // Toggle favorite
  const toggleFavorite = (song: Song) => {
    const isFavorite = favorites.some((fav) => fav.id === song.id)

    if (isFavorite) {
      setFavorites(favorites.filter((fav) => fav.id !== song.id))
    } else {
      setFavorites([...favorites, song])
    }
  }

  // Play next song
  const playNext = () => {
    if (!currentSong) return

    const currentIndex = songs.findIndex((song) => song.id === currentSong.id)
    if (currentIndex < songs.length - 1) {
      playSong(songs[currentIndex + 1])
    }
  }

  // Play previous song
  const playPrevious = () => {
    if (!currentSong) return

    const currentIndex = songs.findIndex((song) => song.id === currentSong.id)
    if (currentIndex > 0) {
      playSong(songs[currentIndex - 1])
    }
  }

  // Set progress on seek
  const handleSeek = (value: number) => {
    if (audioRef.current) {
      const newTime = (value / 100) * audioRef.current.duration
      audioRef.current.currentTime = newTime
      setProgress(value)
    }
  }

  // Get displayed songs based on active tab
  const getDisplayedSongs = () => {
    switch (activeTab) {
      case "favorites":
        return favorites
      case "recentlyPlayed":
        return recentlyPlayed
      case "topTracks":
        return [...songs].sort((a, b) => a.title.localeCompare(b.title))
      default:
        return filteredSongs
    }
  }


  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])



  useEffect(() => {
    if (currentSong?.color) {
      const hex = currentSong.color;

      // Convert hex to rgb
      const rgb = hexToRgb(hex);
      if (!rgb) return;

      const root = document.documentElement;
      root.style.setProperty('--song-theme-color', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
  }, [currentSong]);

  function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
      : null;
  }


  return (
    <div
      className="music-player-container min-h-screen transition-colors duration-700 ease-in-out"
      style={{
        background: currentSong?.color
          ? `linear-gradient(to bottom, ${currentSong.color}, #000000)`
          : "#000000",
      }}
    >
      <audio ref={audioRef} src={currentSong?.musicUrl} />

      <div className="flex h-screen">
        {/* Sidebar -*/}
        <div className={cn("w-[330px] h-full bg-black flex-shrink-0", isMobile && !showSidebar && "hidden")}>
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onClose={() => isMobile && setShowSidebar(false)}
          />
        </div>

        {/* Main content area  */}
        <div
          className="w-[30%] overflow-hidden flex-shrink-0"
          style={{ minWidth: isMobile || isTablet ? "100%" : "350px" }}
        >

          {isMobile && !showSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="m-3 text-white md:hidden"
              onClick={() => setShowSidebar(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}



          <div className="p-6 h-full overflow-hidden flex flex-col">
            {/* Header with title */}
            <h2 className="text-white text-3xl font-bold mb-6">
              {activeTab === "forYou"
                ? "For You"
                : activeTab === "topTracks"
                  ? "Top Tracks"
                  : activeTab === "favorites"
                    ? "Favourites"
                    : "Recently Played"}
            </h2>

            {/* Search bar */}
            <div className="search-container relative mb-6">
              <input
                type="text"
                placeholder="Search Song, Artist"
                className="bg-black/30 text-white rounded-xl py-2 px-4 pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>

            {/* Song list */}
            <div className="flex-1 overflow-hidden">
              <SongList
                songs={getDisplayedSongs()}
                currentSong={currentSong}
                isPlaying={isPlaying}
                onPlay={playSong}
                onToggleFavorite={toggleFavorite}
                favorites={favorites}
              />
            </div>
          </div>
        </div>

        {/* Player section - right side with large album art */}
        {!isMobile && !isTablet && (
          <div className="flex-1 h-full flex flex-col items-start  justify-center p-60">
            {currentSong && (
              <>
                <div className="text-start mb-6">
                  <h2 className="text-white text-3xl font-bold mb-1">{currentSong.title}</h2>
                  <p className="text-gray-300">{currentSong.artistName}</p>
                </div>

                <div className="relative w-full max-w-[400px] aspect-square mb-8">
                  <Image
                    src={currentSong.thumbnail || "/placeholder.svg"}
                    alt={currentSong.title}
                    fill
                    className="object-cover rounded-2xl"
                  />
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-[400px] mb-6">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={progress}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    className="w-full appearance-none bg-white/20 h-1 rounded-full overflow-hidden cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, white ${progress}%, rgba(255, 255, 255, 0.2) ${progress}%)`,
                    }}
                  />

                  <div className="flex justify-between text-gray-400 text-xs mt-1">
                    <span>
                      {Math.floor(
                        ((progress / 100) *
                          (Number.parseInt(currentSong.duration.split(":")[0]) * 60 +
                            Number.parseInt(currentSong.duration.split(":")[1]))) /
                        60,
                      )}
                      :
                      {Math.floor(
                        ((progress / 100) *
                          (Number.parseInt(currentSong.duration.split(":")[0]) * 60 +
                            Number.parseInt(currentSong.duration.split(":")[1]))) %
                        60,
                      )
                        .toString()
                        .padStart(2, "0")}
                    </span>
                    <span>{currentSong.duration}</span>
                  </div>
                </div>


                {/* Playback controls */}
                <div className="flex items-center justify-center gap-10 mb-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="bg-white/10 rounded-full h-10 w-10 flex items-center justify-center text-white hover:bg-white/20">
                        <MoreHorizontal size={20} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-800 text-white border-zinc-700">
                      <DropdownMenuItem
                        onClick={() => currentSong && toggleFavorite(currentSong)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Heart
                          size={16}
                          className={favorites.some((fav) => fav.id === currentSong?.id) ? "text-red-500 fill-red-500" : ""}
                        />
                        {favorites.some((fav) => fav.id === currentSong?.id) ? "Remove from Favorites" : "Add to Favorites"}
                      </DropdownMenuItem>

                    </DropdownMenuContent>
                  </DropdownMenu>


                  <Button variant="ghost" size="icon" onClick={playPrevious} className="text-gray-300 hover:text-white">
                    <SkipBack size={24} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="bg-white text-black rounded-full hover:bg-gray-200 h-14 w-14 flex items-center justify-center"
                  >
                    {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
                  </Button>

                  <Button variant="ghost" size="icon" onClick={playNext} className="text-gray-300 hover:text-white">
                    <SkipForward size={24} />
                  </Button>

                  {/* Volume and options controls */}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-white/10 rounded-full h-10 w-10 flex items-center justify-center text-white hover:bg-white/20"
                        onClick={() => setIsMuted(!isMuted)}
                      >
                        <Volume2 size={18} />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="bg-zinc-800 text-white p-4 w-40">
                      <div className="flex flex-col items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={isMuted ? 0 : volume}
                          onChange={(e) => {
                            setIsMuted(false)
                            setVolume(parseFloat(e.target.value))
                          }}
                          className="w-full"
                        />
                        <span className="text-xs text-gray-300">
                          {isMuted ? "Muted" : `Volume: ${(volume * 100).toFixed(0)}%`}
                        </span>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                </div>







              </>
            )}
          </div>
        )}
      </div>

      {/* Mobile/Tablet player controls - fixed at bottom */}
      {(isMobile || isTablet) && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md p-3">
          {currentSong && (
            <div className="flex items-center">
              <div className="relative w-12 h-12 rounded overflow-hidden mr-3">
                <Image
                  src={currentSong.thumbnail || "/placeholder.svg"}
                  alt={currentSong.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 mr-3">
                <h3 className="text-white text-sm font-medium truncate">{currentSong.title}</h3>
                <p className="text-gray-400 text-xs truncate">{currentSong.artistName}</p>

                {/* Progress bar */}
                <div className="relative mt-1">
                  <div className="h-1 bg-white/20 rounded-full w-full">
                    <div
                      className="h-1 bg-white rounded-full absolute top-0 left-0"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={togglePlay}
                  className="bg-white text-black rounded-full hover:bg-gray-200 h-8 w-8 flex items-center justify-center p-0"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white/10 rounded-full h-8 w-8 flex items-center justify-center text-white hover:bg-white/20 p-0"
                >
                  <MoreHorizontal size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

