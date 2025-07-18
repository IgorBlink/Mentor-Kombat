# Руководство по улучшению звуков в Mentor Kombat

## Текущие звуковые ресурсы

### Существующие звуки:
- **Боевые звуки**: punch.mp3, kick.mp3, hit.mp3, jump.mp3
- **Фоновая музыка**: background-music.mp3, victory.mp3, defeat.mp3
- **Голосовые команды**: fight_voice.m4a, codenow_voice.m4a, deadlineapproaches_voice.m4a, и другие
- **Новые 8-битные звуки**: heavy_punch.mp3, block.mp3, special_attack.mp3, combo_hit.mp3

### Реализованные улучшения:
- ✅ **Звуковые категории**: combat, ui, ambient, voice, music
- ✅ **Динамическая громкость**: настройка по категориям
- ✅ **Комбо звуки**: последовательное воспроизведение с задержками
- ✅ **Предзагрузка звуков**: улучшенная производительность
- ✅ **Улучшенные боевые звуки**: категоризированные звуки атак и блоков

## Рекомендуемые улучшения

### 1. Добавление новых 8-битных звуков

#### Источники бесплатных звуков:
- **OpenGameArt.org**: 512 8-битных звуков (CC0 лицензия)
  - Ссылка: https://opengameart.org/content/512-sound-effects-8-bit-style
  - Архив: https://archive.org/details/TheEssentialRetroVideoGameSoundEffectsCollection512Sounds

- **jsfxr.me**: Онлайн генератор 8-битных звуков
  - Создание кастомных звуков для файтинга
  - Экспорт в WAV/MP3 формат

- **Freesound.org**: 8-Bit Sound Effects Library
  - 40 готовых 8-битных эффектов
  - Включает удары, прыжки, взрывы

#### Рекомендуемые звуки для добавления:
```
/sounds/
├── combat/
│   ├── heavy_punch.mp3     # Сильный удар
│   ├── light_punch.mp3     # Легкий удар
│   ├── block.mp3           # Блок/защита
│   ├── combo_hit.mp3       # Комбо удар
│   ├── special_attack.mp3  # Специальная атака
│   ├── dodge.mp3           # Уклонение
│   └── counter_attack.mp3  # Контратака
├── ui/
│   ├── menu_select.mp3     # Выбор в меню
│   ├── menu_confirm.mp3    # Подтверждение
│   ├── menu_back.mp3       # Назад
│   └── character_hover.mp3 # Наведение на персонажа
└── ambient/
    ├── crowd_cheer.mp3     # Крики толпы
    ├── arena_ambient.mp3   # Звуки арены
    └── tension_build.mp3   # Нарастание напряжения
```

### 2. Реализованная система звуков

#### ✅ Звуковые категории (РЕАЛИЗОВАНО):
```typescript
// В sound-context.tsx
type SoundCategory = 'combat' | 'ui' | 'voice' | 'music' | 'ambient'

interface SoundConfig {
  volume?: number
  category?: SoundCategory
  loop?: boolean
  fadeIn?: number
  fadeOut?: number
}

// Использование:
playSound("/sounds/punch.mp3", { category: 'combat', volume: 0.8 })
```

#### ✅ Звуковые комбо (РЕАЛИЗОВАНО):
```typescript
// Система для проигрывания последовательности звуков
playComboSounds(["/sounds/victory.mp3", "/sounds/heavy_punch.mp3"], [0, 300])
```

#### ✅ Предзагрузка звуков (РЕАЛИЗОВАНО):
```typescript
// В select/page.tsx
preloadSounds(["/sounds/punch.mp3", "/sounds/kick.mp3", "/sounds/hit.mp3"])
```

### 3. ✅ Интегрированная игровая логика (РЕАЛИЗОВАНО)

#### В файле fight/page.tsx:
```typescript
// ✅ Реализованные звуки атак с категориями
playSound("/sounds/punch.mp3", { category: 'combat', volume: 0.8 })
playSound("/sounds/kick.mp3", { category: 'combat', volume: 0.8 })

// ✅ Звуки блокирования
playSound("/sounds/block.mp3", { category: 'combat', volume: 0.9 })

// ✅ Комбо звуки для финишеров
playComboSounds(["/sounds/victory.mp3", "/sounds/heavy_punch.mp3"], [0, 300])
playComboSounds(["/sounds/defeat.mp3", "/sounds/hit.mp3"], [0, 250])

// ✅ Специальные звуки для прыжковых ударов
const hitSound = isJumpKick ? "/sounds/heavy_punch.mp3" : "/sounds/hit.mp3"
playSound(hitSound, { category: 'combat', volume: 0.7 })
```

#### В файле select/page.tsx:
```typescript
// ✅ Улучшенные звуки выбора персонажа
playSound("/sounds/kick.mp3", { category: 'ui', volume: 0.7 }) // Клик
playSound("/sounds/jump.mp3", { category: 'ui', volume: 0.4 }) // Наведение
```

#### В файле winner/page.tsx:
```typescript
// ✅ Категоризированные звуки победы/поражения
playSound("/sounds/victory.mp3", { category: 'ambient', volume: 0.8 })
playSound("/sounds/defeat.mp3", { category: 'ambient', volume: 0.8 })
```

### 4. Создание кастомных звуков

#### Использование jsfxr.me для создания звуков:

**Параметры для звука сильного удара:**
```
Wave Type: Square
Attack Time: 0.01
Sustain Time: 0.1
Decay Time: 0.3
Start Frequency: 200Hz
Freq Slide: -0.3
Low-pass Filter: 0.7
```

**Параметры для звука блока:**
```
Wave Type: Noise
Attack Time: 0.0
Sustain Time: 0.05
Decay Time: 0.2
Start Frequency: 800Hz
High-pass Filter: 0.3
```

**Параметры для звука специальной атаки:**
```
Wave Type: Sawtooth
Attack Time: 0.02
Sustain Time: 0.2
Decay Time: 0.4
Start Frequency: 400Hz
Vibrato Depth: 0.3
Vibrato Speed: 0.5
```

### 5. Оптимизация производительности

#### Предзагрузка звуков:
```typescript
// В sound-context.tsx
const preloadSounds = async () => {
  const soundsToPreload = [
    '/sounds/combat/heavy_punch.mp3',
    '/sounds/combat/light_punch.mp3',
    '/sounds/combat/block.mp3',
    // ... другие критичные звуки
  ]
  
  for (const soundPath of soundsToPreload) {
    const audio = createAudioElement(soundPath)
    if (audio) {
      audioCache.set(soundPath, audio)
    }
  }
}
```

#### Управление памятью:
```typescript
// Очистка неиспользуемых звуков
const cleanupUnusedSounds = () => {
  const maxCacheSize = 20
  if (audioCache.size > maxCacheSize) {
    const oldestKeys = Array.from(audioCache.keys()).slice(0, audioCache.size - maxCacheSize)
    oldestKeys.forEach(key => audioCache.delete(key))
  }
}
```

### 6. Настройки звука для пользователей

#### Добавление громкости по категориям:
```typescript
interface SoundSettings {
  masterVolume: number
  musicVolume: number
  sfxVolume: number
  voiceVolume: number
}

const useSoundSettings = () => {
  const [settings, setSettings] = useState<SoundSettings>({
    masterVolume: 1.0,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    voiceVolume: 0.9
  })
  
  return { settings, setSettings }
}
```

## Заключение

Для максимального эффекта рекомендуется:
1. Скачать пак из 512 звуков с OpenGameArt.org
2. Отобрать 15-20 лучших звуков для файтинга
3. Создать несколько кастомных звуков через jsfxr.me
4. Интегрировать новые звуки в игровую логику
5. Добавить настройки громкости для пользователей

Это создаст более immersive и профессиональный звуковой опыт в игре.