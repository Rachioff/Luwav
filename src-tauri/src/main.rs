#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::fs;
use tauri::Manager;
use std::path::Path;
use std::path::PathBuf;
use sha2::{Sha256, Digest};
use reqwest;
use std::io::Read;

use mime_guess::from_path;
use mime_guess::mime;
use log::{info, error};


#[tauri::command]
async fn upload_and_backup_file(app_handle: tauri::AppHandle, file: Vec<u8>, file_name: String) -> Result<String, String> {
    info!("Starting file upload process for: {}", file_name);

    // 获取文件扩展名
    let extension = Path::new(&file_name)
        .extension()
        .and_then(std::ffi::OsStr::to_str)
        .unwrap_or("");
    info!("File extension: {}", extension);

    // 计算文件哈希
    let hash = format!("{:x}", Sha256::digest(&file));
    info!("File hash: {}", hash);

    // 根据 MIME 类型决定子文件夹
    let mime = from_path(&file_name).first_or_octet_stream();
    let subfolder = match mime.type_() {
        mime::IMAGE => "image",
        mime::AUDIO => "audio",
        mime::VIDEO => "video",
        _ => "doc",
    };
    info!("Subfolder: {}", subfolder);

    // 构建完整的文件路径
    let app_dir: PathBuf = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or_else(|| "Failed to get app directory".to_string())?;
    let media_dir = app_dir.join("media").join(subfolder);
    info!("Media directory: {:?}", media_dir);

    // 确保目录存在
    if let Err(e) = fs::create_dir_all(&media_dir) {
        error!("Failed to create directory: {:?}", e);
        return Err(format!("Failed to create directory: {}", e));
    }

    // 构建文件名（哈希+扩展名）
    let file_name = format!("{}.{}", hash, extension);
    let file_path = media_dir.join(&file_name);
    info!("Full file path: {:?}", file_path);

    // 如果文件不存在，则写入
    if !file_path.exists() {
        if let Err(e) = fs::write(&file_path, &file) {
            error!("Failed to write file: {:?}", e);
            return Err(format!("Failed to write file: {}", e));
        }
        info!("File written successfully");
    } else {
        info!("File already exists, skipping write");
    }

    // 验证文件是否成功写入
    if !file_path.exists() {
        error!("File does not exist after write attempt");
        return Err("File was not successfully written".to_string());
    }

    Ok(file_path.to_str().unwrap().to_string())
}

#[tauri::command]
fn save_file(path: String, content: String) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
async fn proxy_image(url: String) -> Result<Vec<u8>, String> {
    let resp = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    let bytes = resp.bytes().await.map_err(|e| e.to_string())?;
    Ok(bytes.to_vec())
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
        #[cfg(debug_assertions)]
        {
            let window = app.get_window("main").unwrap();
            window.open_devtools();

            let app_dir: PathBuf = app.path_resolver().app_data_dir().unwrap();
            let images_dir: PathBuf = app_dir.join("media");
            fs::create_dir_all(images_dir).unwrap();
        }
        Ok(())
    })
    .invoke_handler(tauri::generate_handler![save_file, upload_and_backup_file])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}