const stageBackgrounds = ["/images/stages/bgarena.png", "/images/stages/bgarena2.png"]

// Function to get a random stage background
export function getRandomStageBackground(): string {
  const randomIndex = Math.floor(Math.random() * stageBackgrounds.length)
  return stageBackgrounds[randomIndex]
}
