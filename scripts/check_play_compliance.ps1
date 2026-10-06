# Contrôle de conformité Google Play pour DZ News.
# Vérifications statiques uniquement — aucun build local n'est exécuté.
$ErrorActionPreference = 'Stop'
$fail = 0

function Check($ok, $label) {
  if ($ok) { Write-Host "[OK]   $label" }
  else { Write-Host "[FAIL] $label"; $script:fail++ }
}

# 1. Icône officielle présente et PNG valide
$icon = 'apps/mobile/assets/icons/icon.png'
if (Test-Path $icon) {
  $bytes = [IO.File]::ReadAllBytes($icon)
  Check ($bytes.Length -gt 4096 -and $bytes[0] -eq 0x89 -and $bytes[1] -eq 0x50) "icone officielle présente et PNG valide"
} else { Check $false "icone officielle presente ($icon)" }

# 2. Dimensions >= 512 (lecture PNG directe)
if (Test-Path $icon) {
  $bytes = [IO.File]::ReadAllBytes($icon)
  $w = ([int]$bytes[16] -shl 24) -bor ([int]$bytes[17] -shl 16) -bor ([int]$bytes[18] -shl 8) -bor [int]$bytes[19]
  $h = ([int]$bytes[20] -shl 24) -bor ([int]$bytes[21] -shl 16) -bor ([int]$bytes[22] -shl 8) -bor [int]$bytes[23]
  Check ($w -ge 512 -and $h -ge 512) "dimensions icone >= 512px (${w}x${h})"
}

# 3. Nom Android cohérent
$manifest = Get-Content 'apps/mobile/android/app/src/main/AndroidManifest.xml' -Raw
Check ($manifest -match 'android:label="DZ News"') "AndroidManifest label = DZ News"

# 4. Titre dans l'app
$main = Get-Content 'apps/mobile/lib/main.dart' -Raw
Check ($main -match "title:\s*'DZ News'") "MaterialApp title = DZ News"

# 5. Manifest web et index.html
$webManifest = Get-Content 'apps/web/public/manifest.json' -Raw
Check ($webManifest -match '"name":\s*"DZ News"' -and $webManifest -match 'icon.png') "manifest web : nom DZ News + icône png"
$webIndex = Get-Content 'apps/web/index.html' -Raw
Check ($webIndex -match '<title>DZ News' -and $webIndex -match 'icon.png') "index.html web : titre DZ News + favicon png"

# 6. Pages contact / about / mentions légales
foreach ($p in @('apps/web/public/contact.html','apps/web/public/about.html','apps/web/public/mentions-legales.html','apps/mobile/web/contact.html','apps/mobile/web/about.html','apps/mobile/web/mentions-legales.html')) {
  Check (Test-Path $p) "page existe : $p"
}
$contact = Get-Content 'apps/web/public/contact.html' -Raw
Check ($contact -match 'forslog@gmail.com' -and $contact -match 'tel:\+213696410953' -and $contact -match 'mailto:forslog@gmail.com') "page contact : email + téléphone fonctionnels"

# 7. Ressources Android référencées
$dirs = @('mipmap-mdpi','mipmap-hdpi','mipmap-xhdpi','mipmap-xxhdpi','mipmap-xxxhdpi')
foreach ($d in $dirs) {
  $f = "apps/mobile/android/app/src/main/res/$d/ic_launcher.png"
  Check (Test-Path $f) "ic_launcher présent : $d"
}
Check (Test-Path 'apps/mobile/android/app/src/main/res/values/styles.xml') "styles.xml présent"
Check (Test-Path 'apps/mobile/android/app/src/main/res/drawable/launch_background.xml') "launch_background présent"

# 8. Aucune référence obsolète de branding
$stale = Get-ChildItem -Recurse -File -Include *.dart,*.ts,*.tsx,*.json,*.html,*.xml,*.md,*.yml,*.yaml,*.gradle,*.kts -Path apps,services,.github | Where-Object { $_.FullName -notmatch 'node_modules|\\build\\|\\dist\\|\\.dart_tool\\|app\\intermediates' } | Select-String -Pattern 'FlutterNews OSINT' -List
Check ($stale.Count -eq 0) "aucune référence 'FlutterNews OSINT' restante dans les sources"

# 9. Métadonnées cartographiques de publication (GDELT date parsing)
$article = Get-Content 'apps/mobile/lib/models/article.dart' -Raw
Check ($article -match 'final String\? author;' -and $article -match 'source:' ) "modèle article : author + source présents"

# 10. Rewrites Firebase
$firebase = Get-Content 'firebase.json' -Raw
Check ($firebase -match '"/contact"' -and $firebase -match '"/about"' -and $firebase -match '"/mentions-legales"') "firebase.json : routes contact/about/mentions-legales"

# 11. Workflow CI présent
Check (Test-Path '.github/workflows/flutter_crossplatform_release.yml') "workflow release présent"

if ($fail -gt 0) { Write-Host "$fail contrôle(s) en échec"; exit 1 }
Write-Host "Tous les contrôles statiques sont passés."
