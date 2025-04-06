"use client"

import { Music, Heart, Clock, BarChart2, X } from "lucide-react"
import { Button } from "./ui/button"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onClose?: () => void
}

export default function Sidebar({ activeTab, setActiveTab, onClose }: SidebarProps) {
  const menuItems = [
    { id: "forYou", label: "For You", icon: <Music /> },
    { id: "topTracks", label: "Top Tracks", icon: <BarChart2 /> },
    { id: "favorites", label: "Favourites", icon: <Heart /> },
    { id: "recentlyPlayed", label: "Recently Played", icon: <Clock /> },
  ]

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
            <img
              src="spotify.png"
              alt="Spotify Logo"
              className="w-5 h-5"
            />
          </div>

        </div>
        <span className="text-white text-xl font-bold">Spotify</span>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white ml-auto md:hidden">
            <X size={20} />
          </Button>
        )}
      </div>

      <nav className="flex-1">
        <ul className="space-y-8">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 text-lg w-full text-left transition-colors ${activeTab === item.id ? "text-white font-medium" : "text-gray-400 hover:text-white"
                  }`}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
            <img src="/placeholder.svg?height=32&width=32" alt="User" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  )
}

