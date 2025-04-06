"use client"

import { MoreHorizontal, Play, Pause } from "lucide-react"
import Image from "next/image"
import type { Song } from "./music-player"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Heart } from "lucide-react"

interface SongListProps {
  songs: Song[]
  currentSong: Song | null
  isPlaying: boolean
  onPlay: (song: Song) => void
  onToggleFavorite: (song: Song) => void
  favorites: Song[]
}

export default function SongList({
  songs,
  currentSong,
  isPlaying,
  onPlay,
  onToggleFavorite,
  favorites,
}: SongListProps) {
  return (
    <div className="song-list space-y-2 cursor-pointer pb-24 overflow-y-auto hide-scrollbar">
      {songs.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No songs found</div>
      ) : (
        songs.map((song) => (
          <div
            key={song.id}
            className={`song-item flex items-center p-3 rounded-xl transition-all ${
              currentSong?.id === song.id ? "bg-white/10" : "hover:bg-white/5"
            }`}
          >
            <div className="flex-shrink-0 mr-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image src={song.thumbnail || "/placeholder.svg"} alt={song.title} fill className="object-cover" />
                <button
                  className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity ${
                    currentSong?.id === song.id && isPlaying ? "opacity-100" : ""
                  }`}
                  onClick={() => onPlay(song)}
                >
                  {currentSong?.id === song.id && isPlaying ? (
                    <Pause className="text-white" size={20} />
                  ) : (
                    <Play className="text-white" size={20} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex-grow min-w-0" onClick={() => onPlay(song)}>
              <h3 className="text-white text-base font-medium truncate">{song.title}</h3>
              <p className="text-gray-400 text-sm truncate">{song.artistName}</p>
            </div>

            <div className="flex-shrink-0 ml-auto flex items-center gap-4">
              <span className="text-gray-400 text-sm">{song.duration}</span>

             
            </div>
          </div>
        ))
      )}
    </div>
  )
}

