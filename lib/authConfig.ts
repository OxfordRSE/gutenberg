import fs from "fs"
import path from "path"
import yaml from "js-yaml"

interface ProviderButtonStyle {
  color?: string
  hover?: string
  icon?: string
}

interface ProviderConfigEntry {
  name?: string
  button?: ProviderButtonStyle
  enabled?: boolean
}

interface RawAuthConfig {
  authentication?: {
    providers?: Record<string, ProviderConfigEntry>
  }
}

const CONFIG_PATH = path.join(process.cwd(), "config", "auth.yaml")
let cached: RawAuthConfig | null = null

function loadConfig(): RawAuthConfig {
  if (cached) return cached
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8")
    const data = yaml.load(raw) as RawAuthConfig
    cached = data || {}
    return cached
  } catch {
    cached = {}
    return cached
  }
}

export function getProviderConfig(id: string): ProviderConfigEntry | undefined {
  const cfg = loadConfig()
  return cfg.authentication?.providers?.[id]
}

export function providerEnabled(id: string): boolean {
  const entry = getProviderConfig(id)
  // GitHub defaults to enabled unless explicitly disabled
  if (id === "github") return entry?.enabled !== false
  // Others default to disabled unless explicitly enabled
  return entry?.enabled === true
}
