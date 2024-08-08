#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use serde_json::Value;

#[tauri::command]
fn save_note(content: String) -> Result<(), String> {
  println!("Saving note: {}", content);
  // Here you would implement the actual saving logic
  Ok(())
}

fn main() {
  // tauri::Builder::default()
  //   .invoke_handler(tauri::generate_handler![save_note])
  //   .run(tauri::generate_context!())
  //   .expect("error while running tauri application");
  println!("hello");
  
}
