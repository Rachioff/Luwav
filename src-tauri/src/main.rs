// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn get_notes_dir(app_handle: tauri::AppHandle) -> Result<String, String> {
    let project_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or_else(|| "Failed to get app directory".to_string())?;
    let notes_dir = project_dir.join("notes");
    
    // 确保 notes 目录存在
    std::fs::create_dir_all(&notes_dir)
        .map_err(|e| format!("Failed to create notes directory: {}", e))?;
    
    notes_dir.to_str()
        .ok_or_else(|| "Failed to convert path to string".to_string())
        .map(String::from)
}

fn main() {
  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
