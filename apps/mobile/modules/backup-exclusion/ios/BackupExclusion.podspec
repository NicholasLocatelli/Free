Pod::Spec.new do |s|
  s.name           = 'BackupExclusion'
  s.version        = '1.0.0'
  s.summary        = 'Keeps the app data out of iCloud and device backups (D-014).'
  s.description    = s.summary
  s.license        = 'UNLICENSED'
  s.author         = 'Approdo'
  s.homepage       = 'https://github.com/NicholasLocatelli/Free'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: 'https://github.com/NicholasLocatelli/Free.git' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.source_files = '**/*.swift'
end
