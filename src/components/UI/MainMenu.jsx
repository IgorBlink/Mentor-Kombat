import { Play, Power, Settings, Trophy, Users, Zap, Shield, Sword, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"

// Sound Manager для меню
const MenuSoundManager = {
  sounds: {},
  userInteracted: false,
  
  init() {
    const soundList = [
      'codenow_voice', 'attendance_voice', 'CIFailed_voice', 
      'CongratsYouHired_voice', 'deadlineapproaches_voice'
    ]
    
    soundList.forEach(soundName => {
      try {
        this.sounds[soundName] = new Audio(`/src/assets/${soundName}.m4a`)
        this.sounds[soundName].preload = 'auto'
        this.sounds[soundName].volume = 0.5
      } catch (error) {
        console.warn(`Could not load sound: ${soundName}`)
      }
    })

    // Добавляем слушатель первого взаимодействия пользователя
    const enableAudio = () => {
      this.userInteracted = true
      document.removeEventListener('click', enableAudio)
      document.removeEventListener('keydown', enableAudio)
      console.log('✅ Audio enabled after user interaction')
    }
    
    document.addEventListener('click', enableAudio, { once: true })
    document.addEventListener('keydown', enableAudio, { once: true })
  },
  
  play(soundName) {
    if (!this.userInteracted) {
      console.log('🔇 Audio not enabled yet - waiting for user interaction')
      return
    }
    
    if (this.sounds[soundName]) {
      this.sounds[soundName].currentTime = 0
      const playPromise = this.sounds[soundName].play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log(`Sound play failed for ${soundName}:`, error.message)
        })
      }
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
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Инициализируем звуки при загрузке компонента
  useEffect(() => {
    MenuSoundManager.init()
  }, [])

  // Пробные данные для демонстрации
const characters = [
  { id: 1, name: "Sub-Zero", color: "bg-blue-500" },
  { id: 2, name: "Scorpion", color: "bg-yellow-500" },
  { id: 3, name: "Raiden", color: "bg-purple-500" },
  { id: 4, name: "Liu Kang", color: "bg-red-500" },
  { id: 5, name: "Kitana", color: "bg-pink-500" },
  { id: 6, name: "Johnny Cage", color: "bg-green-500" },
  { id: 7, name: "Sonya Blade", color: "bg-cyan-500" },
  { id: 8, name: "Kano", color: "bg-orange-500" },
  { id: 9, name: "Jax", color: "bg-gray-500" },
  { id: 10, name: "Goro", color: "bg-red-700" },
  { id: 11, name: "Shang Tsung", color: "bg-indigo-500" },
  { id: 12, name: "Reptile", color: "bg-lime-500" },
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
        MenuSoundManager.play('codenow_voice');
        navigate("/character-select");
      },
    },
    {
      label: "OPTIONS",
      icon: Settings,
      action: () => {
        MenuSoundManager.play('attendance_voice');
        console.log("Showing options...");
      }
    },
    {
      label: "HIGH SCORES",
      icon: Trophy,
      action: () => {
        MenuSoundManager.play('CongratsYouHired_voice');
        console.log("Showing high scores...");
      }
    },
    {
      label: "MULTIPLAYER",
      icon: Users,
      action: () => {
        MenuSoundManager.play('deadlineapproaches_voice');
        console.log("Multiplayer mode...");
      }
    },
    { label: "QUIT", icon: Power, action: () => console.log("Quitting game...") },
  ];
  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Sidebar - Character Showcase */}
      <div className="w-1/4 bg-gradient-to-b from-gray-800 to-gray-900 p-6 border-r-2 border-amber-500">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-amber-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="w-12 h-12 text-black" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Player Status</h3>
          <div className="text-amber-400">Level {playerStatus.level}</div>
          <div className="text-gray-400 text-sm">{playerStatus.class}</div>
          <div className="flex justify-center gap-2 mt-2">
            {playerStatus.status.map((status, i) => (
              <span key={i} className="px-2 py-1 bg-green-600 text-xs rounded text-white">
                {status}
              </span>
            ))}
          </div>
        </div>

        {/* Character Grid */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {characters.map((char) => (
            <div
              key={char.id}
              className={`${char.color} aspect-square rounded flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform cursor-pointer`}
              title={char.name}
            >
              {char.name.charAt(0)}
            </div>
          ))}
        </div>

        {/* Equipment/Stats */}
        <div className="space-y-3">
          <div className="bg-gray-700 p-3 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Sword className="w-4 h-4 text-amber-500" />
              <span className="text-white text-sm">Weapon</span>
            </div>
            <div className="text-amber-400 text-xs">Legendary Blade +15</div>
          </div>
          
          <div className="bg-gray-700 p-3 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-white text-sm">Armor</span>
            </div>
            <div className="text-blue-400 text-xs">Dragon Scale Mail +12</div>
          </div>
          
          <div className="bg-gray-700 p-3 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-white text-sm">Power</span>
            </div>
            <div className="text-yellow-400 text-xs">Combat Rating: 2,847</div>
          </div>
        </div>
      </div>

      {/* Center - Main Menu */}
      <div className="flex-1 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/30"></div>
        <div className="absolute inset-0 pattern-dots opacity-20"></div>
        
        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          {/* Game Title */}
          <div className="text-center mb-16">
            <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-red-500 to-amber-400 mb-4 glow-text">
              MORTAL
            </h1>
            <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-red-500 glow-text">
              KOMBAT
            </h2>
            <p className="text-xl text-gray-400 mt-4 tracking-widest">MENTOR EDITION</p>
          </div>

          {/* Menu Items */}
          <div className="space-y-4 w-full max-w-md">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedIndex(index);
                    if (item.action) {
                      item.action();
                    }
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    w-full p-4 flex items-center gap-4 text-left text-xl font-bold
                    transition-all duration-200 rounded-lg border-2
                    ${isSelected 
                      ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/50 transform scale-105' 
                      : 'bg-gray-800 text-white border-gray-600 hover:border-amber-500 hover:bg-gray-700'
                    }
                  `}
                >
                  <Icon className="w-6 h-6" />
                  <span className="tracking-wider">{item.label}</span>
                  {isSelected && (
                    <div className="ml-auto">
                      <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="mt-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
              <p className="text-amber-400 mt-2">Loading...</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Game Info/News */}
      <div className="w-1/4 bg-gradient-to-b from-gray-800 to-gray-900 p-6 border-l-2 border-amber-500">
        <h3 className="text-xl font-bold text-amber-500 mb-6">Game News</h3>
        
        <div className="space-y-4 text-sm">
          <div className="bg-gray-700 p-4 rounded border-l-4 border-green-500">
            <div className="text-green-400 font-bold mb-1">New Fighter Added!</div>
            <div className="text-gray-300">Scorpion joins the battle with deadly chain attacks.</div>
            <div className="text-gray-500 text-xs mt-2">2 days ago</div>
          </div>
          
          <div className="bg-gray-700 p-4 rounded border-l-4 border-blue-500">
            <div className="text-blue-400 font-bold mb-1">Tournament Mode</div>
            <div className="text-gray-300">Compete in weekly tournaments for exclusive rewards.</div>
            <div className="text-gray-500 text-xs mt-2">1 week ago</div>
          </div>
          
          <div className="bg-gray-700 p-4 rounded border-l-4 border-purple-500">
            <div className="text-purple-400 font-bold mb-1">New Arena</div>
            <div className="text-gray-300">Fight in the mystical Demo Day Hall arena.</div>
            <div className="text-gray-500 text-xs mt-2">2 weeks ago</div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <h4 className="text-lg font-bold text-amber-500 mb-4">Your Stats</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Wins</span>
              <span className="text-green-400 font-bold">147</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Losses</span>
              <span className="text-red-400 font-bold">23</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Win Rate</span>
              <span className="text-amber-400 font-bold">86.5%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Favorite Fighter</span>
              <span className="text-blue-400 font-bold">Sub-Zero</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 right-6 text-xs text-gray-500">
          <div>v1.0.0 BETA</div>
          <div>© 2024 Nfactorial</div>
        </div>
      </div>
    </div>
  );
}