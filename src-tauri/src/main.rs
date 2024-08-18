// Prevents additional console window on Windows in release, DO NOT REMOVE!!
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;
use std::path::Path;
use std::hash::Hasher;
use std::collections::hash_map::DefaultHasher;
use std::hash::Hash;
// use uuid::Uuid;

fn calculate_hash<T: Hash>(t: &T) -> u64 {
    let mut hasher = DefaultHasher::new();
    t.hash(&mut hasher);
    hasher.finish()
}

#[tauri::command]
fn get_notes_dir(app_handle: tauri::AppHandle) -> Result<String, String> {
    let project_dir: PathBuf = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or_else(|| "Failed to get app directory".to_string())?;
    let notes_dir: PathBuf = project_dir.join("notes");
    
    // 确保 notes 目录存在
    std::fs::create_dir_all(&notes_dir)
        .map_err(|e: std::io::Error| format!("Failed to create notes directory: {}", e))?;
    
    notes_dir.to_str()
        .ok_or_else(|| "Failed to convert path to string".to_string())
        .map(String::from)
}

#[tauri::command]
async fn save_image(app_handle: tauri::AppHandle, file_data: Vec<u8>, file_name: String) -> Result<String, String> {
    let app_dir: PathBuf = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or_else(|| "Failed to get app directory".to_string())?;
    let images_dir: PathBuf = app_dir.join("images");
    fs::create_dir_all(&images_dir).map_err(|e| e.to_string())?;

    let extension: &str = Path::new(&file_name)
        .extension()
        .and_then(|ext: &std::ffi::OsStr| ext.to_str())
        .unwrap_or("png");  // 默认使用 png，如果无法确定扩展名
    let new_file_name = format!("{}.{}", calculate_hash(&file_data).to_string(), extension); // format!("{}.{}", Uuid::new_v4(), extension);
    let file_path: PathBuf = images_dir.join(&new_file_name);

    fs::write(&file_path, file_data).map_err(|e| e.to_string())?;

    Ok(file_path.to_str().unwrap().to_string())
}

fn main() {
    tauri::Builder::default()
        .setup(|app: &mut tauri::App| {
            // 确保应用数据目录存在
            let app_dir: PathBuf = app.path_resolver().app_data_dir().unwrap();
            let images_dir: PathBuf = app_dir.join("images");
            fs::create_dir_all(images_dir).unwrap();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![save_image, get_notes_dir])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
