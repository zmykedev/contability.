export function cleanRut(rut: string): string {
  return rut.replace(/[.\-\s]/g, "").toUpperCase()
}

export function validateRut(rut: string): boolean {
  const cleaned = cleanRut(rut)
  if (cleaned.length < 2) return false

  const body = cleaned.slice(0, -1)
  const checkDigit = cleaned.slice(-1)

  if (!/^\d+$/.test(body)) return false

  let sum = 0
  let multiplier = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]!, 10) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const remainder = 11 - (sum % 11)
  let expected: string
  if (remainder === 11) expected = "0"
  else if (remainder === 10) expected = "K"
  else expected = remainder.toString()

  return checkDigit === expected
}

export function formatRut(rut: string): string {
  const cleaned = cleanRut(rut)
  if (cleaned.length < 2) return rut

  const body = cleaned.slice(0, -1)
  const checkDigit = cleaned.slice(-1)

  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  return `${formatted}-${checkDigit}`
}
