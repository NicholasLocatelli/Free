import ExpoModulesCore

/// Marks a directory as excluded from iCloud and device backups (D-014). The flag on a
/// directory also covers every file created inside it later, e.g. the SQLite database
/// and its WAL files.
public class BackupExclusionModule: Module {
  public func definition() -> ModuleDefinition {
    Name("BackupExclusion")

    Function("excludeDirectoryFromBackup") { (path: String) throws -> Bool in
      var url = URL(fileURLWithPath: path, isDirectory: true)
      try FileManager.default.createDirectory(at: url, withIntermediateDirectories: true)
      var values = URLResourceValues()
      values.isExcludedFromBackup = true
      try url.setResourceValues(values)
      return try url.resourceValues(forKeys: [.isExcludedFromBackupKey]).isExcludedFromBackup ?? false
    }
  }
}
