import { useState, useMemo } from 'react'
import { Copy, Sun, Moon, Languages, Search } from 'lucide-react'

const translations = {
  en: {
    title: 'Unicode Lookup',
    subtitle: 'Search Unicode characters by name, code point or symbol. View UTF-8, HTML entity and description.',
    searchPlaceholder: 'Search by name, code point (U+1F600), or paste a symbol...',
    results: 'Results',
    codePoint: 'Code Point',
    utf8: 'UTF-8 Hex',
    htmlEntity: 'HTML Entity',
    category: 'Category',
    name: 'Name',
    copy: 'Copy',
    copied: 'Copied!',
    noResults: 'No results found.',
    ranges: 'Common Ranges',
    builtBy: 'Built by',
  },
  pt: {
    title: 'Consulta Unicode',
    subtitle: 'Busque caracteres Unicode por nome, ponto de codigo ou simbolo. Veja UTF-8, entidade HTML e descricao.',
    searchPlaceholder: 'Busque por nome, ponto de codigo (U+1F600) ou cole um simbolo...',
    results: 'Resultados',
    codePoint: 'Ponto de Codigo',
    utf8: 'UTF-8 Hex',
    htmlEntity: 'Entidade HTML',
    category: 'Categoria',
    name: 'Nome',
    copy: 'Copiar',
    copied: 'Copiado!',
    noResults: 'Nenhum resultado encontrado.',
    ranges: 'Intervalos Comuns',
    builtBy: 'Criado por',
  },
} as const

type Lang = keyof typeof translations

// Curated list of notable Unicode characters
const UNICODE_DATA: { cp: number; name: string; category: string }[] = [
  // Basic Latin symbols
  { cp: 0x0021, name: 'EXCLAMATION MARK', category: 'Punctuation' },
  { cp: 0x0026, name: 'AMPERSAND', category: 'Punctuation' },
  { cp: 0x0040, name: 'COMMERCIAL AT', category: 'Punctuation' },
  { cp: 0x00A9, name: 'COPYRIGHT SIGN', category: 'Symbol' },
  { cp: 0x00AE, name: 'REGISTERED SIGN', category: 'Symbol' },
  { cp: 0x00B0, name: 'DEGREE SIGN', category: 'Symbol' },
  { cp: 0x00B1, name: 'PLUS-MINUS SIGN', category: 'Math' },
  { cp: 0x00D7, name: 'MULTIPLICATION SIGN', category: 'Math' },
  { cp: 0x00F7, name: 'DIVISION SIGN', category: 'Math' },
  // Currency
  { cp: 0x0024, name: 'DOLLAR SIGN', category: 'Currency' },
  { cp: 0x00A2, name: 'CENT SIGN', category: 'Currency' },
  { cp: 0x00A3, name: 'POUND SIGN', category: 'Currency' },
  { cp: 0x00A5, name: 'YEN SIGN', category: 'Currency' },
  { cp: 0x20AC, name: 'EURO SIGN', category: 'Currency' },
  { cp: 0x20BF, name: 'BITCOIN SIGN', category: 'Currency' },
  { cp: 0x20B9, name: 'INDIAN RUPEE SIGN', category: 'Currency' },
  // Greek letters
  { cp: 0x03B1, name: 'GREEK SMALL LETTER ALPHA', category: 'Greek' },
  { cp: 0x03B2, name: 'GREEK SMALL LETTER BETA', category: 'Greek' },
  { cp: 0x03B3, name: 'GREEK SMALL LETTER GAMMA', category: 'Greek' },
  { cp: 0x03C0, name: 'GREEK SMALL LETTER PI', category: 'Greek' },
  { cp: 0x03A9, name: 'GREEK CAPITAL LETTER OMEGA', category: 'Greek' },
  { cp: 0x03A3, name: 'GREEK CAPITAL LETTER SIGMA', category: 'Greek' },
  // Math
  { cp: 0x221E, name: 'INFINITY', category: 'Math' },
  { cp: 0x221A, name: 'SQUARE ROOT', category: 'Math' },
  { cp: 0x2211, name: 'N-ARY SUMMATION', category: 'Math' },
  { cp: 0x222B, name: 'INTEGRAL', category: 'Math' },
  { cp: 0x2248, name: 'ALMOST EQUAL TO', category: 'Math' },
  { cp: 0x2260, name: 'NOT EQUAL TO', category: 'Math' },
  { cp: 0x2264, name: 'LESS-THAN OR EQUAL TO', category: 'Math' },
  { cp: 0x2265, name: 'GREATER-THAN OR EQUAL TO', category: 'Math' },
  // Arrows
  { cp: 0x2190, name: 'LEFTWARDS ARROW', category: 'Arrow' },
  { cp: 0x2191, name: 'UPWARDS ARROW', category: 'Arrow' },
  { cp: 0x2192, name: 'RIGHTWARDS ARROW', category: 'Arrow' },
  { cp: 0x2193, name: 'DOWNWARDS ARROW', category: 'Arrow' },
  { cp: 0x21D2, name: 'RIGHTWARDS DOUBLE ARROW', category: 'Arrow' },
  { cp: 0x21D4, name: 'LEFT RIGHT DOUBLE ARROW', category: 'Arrow' },
  // Box drawing
  { cp: 0x2500, name: 'BOX DRAWINGS LIGHT HORIZONTAL', category: 'Box' },
  { cp: 0x2502, name: 'BOX DRAWINGS LIGHT VERTICAL', category: 'Box' },
  { cp: 0x250C, name: 'BOX DRAWINGS LIGHT DOWN AND RIGHT', category: 'Box' },
  { cp: 0x2510, name: 'BOX DRAWINGS LIGHT DOWN AND LEFT', category: 'Box' },
  { cp: 0x2514, name: 'BOX DRAWINGS LIGHT UP AND RIGHT', category: 'Box' },
  { cp: 0x2518, name: 'BOX DRAWINGS LIGHT UP AND LEFT', category: 'Box' },
  // Common Emoji
  { cp: 0x1F600, name: 'GRINNING FACE', category: 'Emoji' },
  { cp: 0x1F601, name: 'GRINNING FACE WITH SMILING EYES', category: 'Emoji' },
  { cp: 0x1F602, name: 'FACE WITH TEARS OF JOY', category: 'Emoji' },
  { cp: 0x1F60D, name: 'SMILING FACE WITH HEART-EYES', category: 'Emoji' },
  { cp: 0x1F614, name: 'PENSIVE FACE', category: 'Emoji' },
  { cp: 0x1F622, name: 'CRYING FACE', category: 'Emoji' },
  { cp: 0x2764, name: 'HEAVY BLACK HEART', category: 'Emoji' },
  { cp: 0x1F44D, name: 'THUMBS UP SIGN', category: 'Emoji' },
  { cp: 0x1F44E, name: 'THUMBS DOWN SIGN', category: 'Emoji' },
  { cp: 0x1F525, name: 'FIRE', category: 'Emoji' },
  { cp: 0x1F4AF, name: 'HUNDRED POINTS SYMBOL', category: 'Emoji' },
  { cp: 0x2B50, name: 'WHITE MEDIUM STAR', category: 'Emoji' },
  { cp: 0x1F4A1, name: 'ELECTRIC LIGHT BULB', category: 'Emoji' },
  { cp: 0x1F4BB, name: 'PERSONAL COMPUTER', category: 'Emoji' },
  { cp: 0x1F4F1, name: 'MOBILE PHONE', category: 'Emoji' },
  { cp: 0x1F512, name: 'LOCK', category: 'Emoji' },
  { cp: 0x1F511, name: 'KEY', category: 'Emoji' },
  // Misc symbols
  { cp: 0x2605, name: 'BLACK STAR', category: 'Symbol' },
  { cp: 0x2606, name: 'WHITE STAR', category: 'Symbol' },
  { cp: 0x2713, name: 'CHECK MARK', category: 'Symbol' },
  { cp: 0x2717, name: 'BALLOT X', category: 'Symbol' },
  { cp: 0x2022, name: 'BULLET', category: 'Symbol' },
  { cp: 0x2026, name: 'HORIZONTAL ELLIPSIS', category: 'Punctuation' },
  { cp: 0x2014, name: 'EM DASH', category: 'Punctuation' },
  { cp: 0x2013, name: 'EN DASH', category: 'Punctuation' },
  { cp: 0x201C, name: 'LEFT DOUBLE QUOTATION MARK', category: 'Punctuation' },
  { cp: 0x201D, name: 'RIGHT DOUBLE QUOTATION MARK', category: 'Punctuation' },
  { cp: 0x2018, name: 'LEFT SINGLE QUOTATION MARK', category: 'Punctuation' },
  { cp: 0x2019, name: 'RIGHT SINGLE QUOTATION MARK', category: 'Punctuation' },
]

function toUtf8Hex(cp: number): string {
  const s = String.fromCodePoint(cp)
  const bytes: number[] = []
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i)
    if (code < 0x80) bytes.push(code)
    else if (code < 0x800) { bytes.push(0xC0 | (code >> 6)); bytes.push(0x80 | (code & 0x3F)) }
    else { bytes.push(0xE0 | (code >> 12)); bytes.push(0x80 | ((code >> 6) & 0x3F)); bytes.push(0x80 | (code & 0x3F)) }
  }
  return bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')
}

function toHtmlEntity(cp: number): string {
  return `&#${cp};`
}

function cpStr(cp: number): string {
  return `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`
}

const RANGES = [
  { name: 'Basic Latin', from: 0x0000, to: 0x007F },
  { name: 'Latin-1 Supplement', from: 0x0080, to: 0x00FF },
  { name: 'Greek / Coptic', from: 0x0370, to: 0x03FF },
  { name: 'General Punctuation', from: 0x2000, to: 0x206F },
  { name: 'Mathematical Operators', from: 0x2200, to: 0x22FF },
  { name: 'Arrows', from: 0x2190, to: 0x21FF },
  { name: 'Box Drawing', from: 0x2500, to: 0x257F },
  { name: 'Miscellaneous Symbols', from: 0x2600, to: 0x26FF },
  { name: 'Emoticons', from: 0x1F600, to: 0x1F64F },
  { name: 'Misc Symbols & Pictographs', from: 0x1F300, to: 0x1F5FF },
]

export default function UnicodeLookup() {
  const [lang, setLang] = useState<Lang>(() => navigator.language.startsWith('pt') ? 'pt' : 'en')
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState<Record<string, boolean>>({})

  const t = translations[lang]

  const toggleDark = () => {
    setDark(d => {
      document.documentElement.classList.toggle('dark', !d)
      return !d
    })
  }

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return UNICODE_DATA.slice(0, 30)

    // Code point search: U+XXXX or 0xXXXX or decimal
    const cpMatch = q.match(/^(?:U\+|0x)?([0-9a-fA-F]+)$/)
    if (cpMatch) {
      const cp = parseInt(cpMatch[1], 16)
      if (!isNaN(cp) && cp >= 0 && cp <= 0x10FFFF) {
        return [{ cp, name: `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`, category: 'Direct' }]
      }
    }

    // Single char search
    if ([...q].length === 1) {
      const cp = q.codePointAt(0) ?? 0
      const found = UNICODE_DATA.find(d => d.cp === cp)
      return found ? [found] : [{ cp, name: `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`, category: 'Direct' }]
    }

    // Name search
    const upper = q.toUpperCase()
    return UNICODE_DATA.filter(d => d.name.includes(upper) || d.category.toUpperCase().includes(upper)).slice(0, 30)
  }, [query])

  const copyVal = (key: string, val: string) => {
    navigator.clipboard.writeText(val).then(() => {
      setCopied(c => ({ ...c, [key]: true }))
      setTimeout(() => setCopied(c => ({ ...c, [key]: false })), 2000)
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Search size={18} className="text-white" />
            </div>
            <span className="font-semibold">Unicode Lookup</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />
              {lang.toUpperCase()}
            </button>
            <button onClick={toggleDark} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/unicode-lookup" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Common ranges */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
            <h2 className="font-semibold text-sm">{t.ranges}</h2>
            <div className="flex flex-wrap gap-2">
              {RANGES.map(r => (
                <button
                  key={r.name}
                  onClick={() => setQuery(`U+${r.from.toString(16).toUpperCase().padStart(4, '0')}`)}
                  className="px-3 py-1 rounded-full text-xs border border-zinc-200 dark:border-zinc-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                >
                  {r.name} ({cpStr(r.from)}–{cpStr(r.to)})
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
            <h2 className="font-semibold">{t.results} ({results.length})</h2>
            {results.length === 0 ? (
              <p className="text-zinc-400 italic text-sm">{t.noResults}</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {results.map(({ cp, name, category }) => {
                  const char = String.fromCodePoint(cp)
                  const key = `cp-${cp}`
                  return (
                    <div key={cp} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl leading-none">{char}</span>
                        <button
                          onClick={() => copyVal(key, char)}
                          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-purple-500 transition-colors"
                        >
                          <Copy size={12} />
                          {copied[key] ? t.copied : t.copy}
                        </button>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">{t.name}</span>
                          <span className="font-semibold text-right text-purple-600 dark:text-purple-400 max-w-[60%] text-right">{name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">{t.codePoint}</span>
                          <span className="font-mono font-semibold">{cpStr(cp)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">{t.utf8}</span>
                          <span className="font-mono">{toUtf8Hex(cp)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">{t.htmlEntity}</span>
                          <span className="font-mono">{toHtmlEntity(cp)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">{t.category}</span>
                          <span>{category}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-purple-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
