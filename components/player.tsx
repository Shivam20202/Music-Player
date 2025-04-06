"use client"

import { useState } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, MoreHorizontal, Heart } from "lucide-react"
import Image from "next/image"
import type { Song } from "./music-player"
import { Slider } from "./ui/slider"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface PlayerProps {
  song: Song | null
  isPlaying: boolean
  progress: number
  volume: number
  onTogglePlay: () => void
  onSeek: (value: number) => void
  onVolumeChange: (value: number) => void
  onNext: () => void
  onPrevious: () => void
  onToggleFavorite: (song: Song) => void
  isFavorite: boolean
}

export default function Player({
  song,
  isPlaying,
  progress,
  volume,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onNext,
  onPrevious,
  onToggleFavorite,
  isFavorite,
}: PlayerProps) {
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  if (!song) return null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Extract minutes and seconds from duration string (e.g., "4:16")
  const [minutes, seconds] = song.duration.split(":").map(Number)
  const totalSeconds = minutes * 60 + seconds
  const currentSeconds = (progress / 100) * totalSeconds

  return (
    <div className="player-container p-3">
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Progress bar - spans full width */}
        <div className="col-span-12 mb-2">
          <Slider
            value={[progress]}
            onValueChange={(values) => onSeek(values[0])}
            max={100}
            step={0.1}
            className="h-1 cursor-pointer"
          />
        </div>

        {/* Song info */}
        <div className="col-span-4 md:col-span-3 flex items-center">
          <div className="relative w-14 h-14 overflow-hidden mr-3 flex-shrink-0">
            <Image src={song.thumbnail || "/placeholder.svg"} alt={song.title} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <h3 className="text-white text-base font-medium truncate">{song.title}</h3>
            <p className="text-gray-400 text-sm truncate">{song.artistName}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="col-span-4 md:col-span-6 flex items-center justify-center gap-4">
          <Button variant="ghost" size="icon" onClick={onPrevious} className="text-gray-300 hover:text-white">
            <SkipBack size={20} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onTogglePlay}
            className="bg-white text-black rounded-full hover:bg-gray-200 h-10 w-10 flex items-center justify-center"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>

          <Button variant="ghost" size="icon" onClick={onNext} className="text-gray-300 hover:text-white">
            <SkipForward size={20} />
          </Button>

          <span className="text-gray-400 text-xs hidden md:inline-block">
            {formatTime(currentSeconds)} / {song.duration}
          </span>
        </div>

        {/* Volume and options */}
        <div className="col-span-4 md:col-span-3 flex items-center justify-end gap-2">
          <div className="relative flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white"
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            >
              <Volume2 size={20} />
            </Button>

            {showVolumeSlider && (
              <div className="absolute bottom-full mb-2 bg-zinc-800 p-3 rounded-lg w-32">
                <Slider
                  value={[volume * 100]}
                  onValueChange={(values) => onVolumeChange(values[0] / 100)}
                  max={100}
                  step={1}
                  className="h-1 cursor-pointer"
                />
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                <MoreHorizontal size={20} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-800 text-white border-zinc-700">
              <DropdownMenuItem
                onClick={() => song && onToggleFavorite(song)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Heart size={16} className={isFavorite ? "text-red-500 fill-red-500" : ""} />
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

