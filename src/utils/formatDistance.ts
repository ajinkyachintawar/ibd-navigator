// Walking speed 1.4 m/s — WHO/urban-planning standard, validated by agent
export function getWalkingTime(metres: number): string {
  return `${Math.ceil(metres / 1.4 / 60)} min`
}

export function formatDistance(metres: number): string {
  //   = non-breaking space — keeps number and unit on the same line always
  return metres < 1000
    ? `${Math.round(metres)} m`
    : `${(metres / 1000).toFixed(1)} km`
}
