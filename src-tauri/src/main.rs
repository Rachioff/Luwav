#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::fs;
use tauri::Manager;

#[tauri::command]
fn save_file(path: String, content: String) -> Result<(), String> {
  fs::write(path, content).map_err(|e| e.to_string())
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      #[cfg(debug_assertions)]
      {
        let window = app.get_window("main").unwrap();
        window.open_devtools();
      }
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![save_file])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}