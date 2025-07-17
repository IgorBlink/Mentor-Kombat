import { Play, Power, Settings, Trophy, Users, Zap, Shield, Sword, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { Button } from "@/components/UI/8bit/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/UI/8bit/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Импортируем звуковые файлы
import pitchSound from '../../assets/pitch_voice.m4a'
import codeNowSound from '../../assets/codenow_voice.m4a'

// Звуковой менеджер для меню
const MenuSoundManager = {
  sounds: {},
  
  init() {
    this.sounds = {
      menuMusic: new Audio(pitchSound),
      select: new Audio(codeNowSound)
    }
    
    // Настройка громкости
    this.sounds.menuMusic.volume = 0.3
    this.sounds.select.volume = 0.6
    this.sounds.menuMusic.loop = true
  },
  
  play(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName].currentTime = 0
      this.sounds[soundName].play().catch(e => console.log('Menu Sound play failed:', e))
    }
  },
  
  stop(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName].pause()
      this.sounds[soundName].currentTime = 0
    }
  }
}

export default function MainMenu({
  className,
  ...props
}) {
  const navigate = useNavigate()
  const [animationClass, setAnimationClass] = useState('')
  const [keyLayout, setKeyLayout] = useState('standard') // 'standard' или 'alternative'

  // Инициализация звукового менеджера
  useEffect(() => {
    MenuSoundManager.init()
    // Запускаем фоновую музыку меню
    setTimeout(() => {
      MenuSoundManager.play('menuMusic')
    }, 1000)
    
    // Останавливаем музыку при уходе с компонента
    return () => {
      MenuSoundManager.stop('menuMusic')
    }
  }, [])

const statsCards = [
  {
    title: "Active Now",
    value: "+573",
    change: "+201 since last hour",
    icon: Zap,
    color: "text-green-400"
  },
  {
    title: "Subscriptions", 
    value: "+2350",
    change: "+18.1% from last month",
    icon: Users,
    color: "text-blue-400"
  },
  {
    title: "Upvoters",
    value: "+99", 
    change: "",
    icon: Sword,
    color: "text-red-400"
  }
];

// 8bit style avatars data
const avatars = [
  { id: 1, name: "Bakhredin", color: "bg-green-600" },
  { id: 2, name: "Diana", color: "bg-red-600" },
  { id: 3, name: "Shoqqan", color: "bg-blue-600" },
  { id: 4, name: "Armansu", color: "bg-purple-600" },
  { id: 5, name: "Alikhan", color: "bg-yellow-600" },
  { id: 6, name: "Gaziz", color: "bg-emerald-600" },
  { id: 7, name: "Bernar", color: "bg-cyan-600" },
  { id: 8, name: "Alibek", color: "bg-gray-600" },
  { id: 9, name: "Zhasulan", color: "bg-orange-600" },
  { id: 10, name: "Ice Queen", color: "bg-indigo-600" },
  { id: 11, name: "Earth Golem", color: "bg-amber-700" },
  { id: 12, name: "Wind Archer", color: "bg-teal-600" },
  { id: 13, name: "Light Cleric", color: "bg-pink-500" },
  { id: 14, name: "Dark Warlock", color: "bg-slate-700" },
  { id: 15, name: "Blood Vampire", color: "bg-rose-800" },
  { id: 16, name: "Nature Druid", color: "bg-lime-600" },
];

const playerStatus = {
  level: 42,
  class: "Warrior",
  status: ["Critical", "Online"]
};

  const menuItems = [
    {
      label: "START GAME",
      icon: Play,
      action: () => {
        MenuSoundManager.play('select');
        navigate("/game");
      },
    },
    {
      label: "OPTIONS",
      icon: Settings,
      action: () => console.log("Showing options..."),
    },
    {
      label: "HIGH SCORES",
      icon: Trophy,
      action: () => console.log("Showing high scores..."),
    },
    {
      label: "MULTIPLAYER",
      icon: Users,
      action: () => console.log("Multiplayer mode..."),
    },
    { label: "QUIT", icon: Power, action: () => console.log("Quitting game...") },
  ];
  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Resizable Panel Layout */}
      <div className="flex w-full h-screen">
        
        {/* Left Panel - Main Menu (Half Screen) */}
        <div className="w-1/2 border-r-2 border-gray-600 flex items-center justify-center p-8">
          <Card className={cn("w-full max-w-md bg-gray-800 border-gray-600", className)} {...props}>
            <CardHeader className="flex flex-col items-center justify-center gap-4 pb-8">
              <CardTitle className="text-4xl text-gray-100 font-bold tracking-wider">
                MAIN MENU
              </CardTitle>
              <CardDescription className="text-lg text-gray-400 text-center">
                Nfactorial Mentor Combat
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8">
              <div className="flex flex-col gap-6">
                {menuItems.map((item) => (
                  <Button 
                    key={item.label} 
                    className="flex items-center gap-4 text-left justify-start h-16 text-lg bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600 font-bold"
                    onClick={item.action}
                  >
                    <item.icon className="size-6" />
                    <span>{item.label}</span>
                  </Button>
                ))}
      </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Statistics (Half Screen) */}
        <div className="w-1/2 flex flex-col">
          
          {/* Top Section - Stats Cards + Horizontal Scroll */}
          <div className="h-3/4 border-b-2 border-gray-600 p-8 flex gap-6">
            
            {/* Stats Cards - Left side */}
            <div className="flex-1">
              <div className="grid grid-cols-1 gap-6 h-full">
                {statsCards.map((stat, index) => (
                  <Card key={index} className="bg-gray-800 border-gray-600 flex flex-col justify-center">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium text-gray-300">
                        {stat.title}
                      </CardTitle>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                        {stat.value}
                      </div>
                      <p className="text-sm text-gray-500">
                        {stat.change}
                      </p>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>

            {/* Horizontal Scroll Area - Right side */}
            <div className="w-80">
              <Card className="bg-gray-800 border-gray-600 h-full">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-300">Hot Mentors</CardTitle>
                  <CardDescription className="text-gray-500">УДАЧИИИИ ААААААА 🤼‍♂️🤼‍♂️🤼‍♂️🤼‍♂️🤼‍♂️🤼‍♂️</CardDescription>
                </CardHeader>
                <CardContent className="h-full pb-6">
                  <ScrollArea orientation="horizontal" className="h-full w-full">
                    <div className="grid grid-rows-2 grid-flow-col gap-3 p-4 h-full min-w-max">
                      {avatars.map((avatar) => (
                        <div key={avatar.id} className="flex-shrink-0">
                          <div className={`w-20 h-24 ${avatar.color} border-2 border-gray-600 relative`}>
                            {/* 8bit pixel art style avatar */}
                            <div className="absolute inset-1 grid grid-cols-4 grid-rows-5 gap-0">
                              {/* Simple pixel pattern */}
                              <div className="bg-yellow-400 col-span-2 col-start-2"></div>
                              <div className="bg-yellow-400 col-span-4"></div>
                              <div className="bg-black col-span-1"></div>
                              <div className="bg-white col-span-2"></div>
                              <div className="bg-black col-span-1"></div>
                              <div className="bg-red-600 col-span-2 col-start-2"></div>
                              <div className={`${avatar.color} col-span-4`}></div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 mt-1 text-center truncate w-20">
                            {avatar.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
        </div>
      </div>

          {/* Bottom Section - Player Status */}
          <div className="h-1/4 p-8 flex items-center justify-center">
            <Card className="bg-gray-800 border-gray-600 w-full">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-300 flex items-center gap-3">
                  <User className="h-5 w-5 text-purple-400" />
                  Player Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-yellow-600 text-yellow-100 text-sm rounded-lg font-bold">
                    Level {playerStatus.level}
                  </span>
                  <span className="px-4 py-2 bg-red-600 text-red-100 text-sm rounded-lg font-bold">
                    {playerStatus.class}
                  </span>
                  {playerStatus.status.map((status, index) => (
                    <span 
                      key={index}
                      className={`px-4 py-2 text-sm rounded-lg font-bold ${
                        status === "Critical" 
                          ? "bg-red-700 text-red-100" 
                          : "bg-green-600 text-green-100"
                      }`}
                    >
                      {status}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}