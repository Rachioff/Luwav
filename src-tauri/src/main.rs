#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::fs;
use std::string;
use app::OriginMonitorError;
use futures::future::ok;
use models::cluster;
use tauri::App;
use tauri::Manager;
use std::path::Path;
use std::path::PathBuf;
use sha2::{Sha256, Digest};
use reqwest;
use std::io::Read;

use mime_guess::from_path;
use mime_guess::mime;
use log::{info, error};

use std::sync::Arc;
mod models;
mod init;
use models::origin::Origin;
use models::cluster::Cluster;
use init::{AppState, convert_to_frontend_format, FrontendOrigin};



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

#[tauri::command] // 以下是之前为了将URL图片下载下来写的，不过后来发现是协议的问题，这个还有没有用已经忘记了，到时候测试一下
async fn proxy_image(url: String) -> Result<Vec<u8>, String> {
    let resp = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    let bytes = resp.bytes().await.map_err(|e| e.to_string())?;
    Ok(bytes.to_vec())
}

#[tauri::command]
fn get_initial_data(state: tauri::State<AppState>) -> Result<Vec<FrontendOrigin>, String> {
    convert_to_frontend_format(&state).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_origin(app_state: tauri::State<AppState>) -> Result<(), String> {
    app_state.origins.lock().unwrap().push(Origin::new(app_state.monitor.clone()).map_err(|e| e.to_string())?);
    Ok(())
}

#[tauri::command]
fn create_cluster(app_state: tauri::State<AppState>, origin_id: i64) -> Result<(), String> {
    for origin in app_state.origins.lock().unwrap().iter() {
        if origin.lock().unwrap().id == origin_id{
            let new_cluster = Origin::create_cluster(origin.clone()).map_err(|e| e.to_string())?;
            app_state.clusters.lock().unwrap().push(new_cluster.clone());
            break;
        }
    }
    Ok(())
}

#[tauri::command]
fn create_wave(app_state: tauri::State<AppState>, cluster_id: i64) -> Result<(), String> {
    for cluster in app_state.clusters.lock().unwrap().iter() {
        if cluster.lock().unwrap().id == cluster_id{
            let new_wave = Cluster::create_wave(cluster.clone()).map_err(|e| e.to_string())?;
            app_state.waves.lock().unwrap().push(new_wave.clone());
            break;      
        }
    } 
    Ok(())
}

#[tauri::command]
fn delete_origin(app_state: tauri::State<AppState>, origin_id: i64) -> Result<(), String> {
    let mut pos = 0;  // 这里确信了前端返回的id值有效，因为前端的数据是基于后端的
    for i in 0..app_state.origins.lock().unwrap().len() {
        if app_state.origins.lock().unwrap()[i].lock().unwrap().id == origin_id {
            pos = i;
            break;
        }
    }
    println!("{}  {}", pos, app_state.origins.lock().unwrap()[pos].lock().unwrap().name);
    let to_be_delete = app_state.origins.lock().unwrap().remove(pos);
    to_be_delete.lock().unwrap().delete().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn delete_cluster(app_state: tauri::State<AppState>, cluster_id: i64) -> Result<(), String> {
    let mut pos = 0;  // 这里又确信了前端返回的id值有效，因为前端的数据是基于后端的
    for i in 0..app_state.clusters.lock().unwrap().len() {
        if app_state.clusters.lock().unwrap()[i].lock().unwrap().id == cluster_id {
            pos = i;
            break;
        }
    }
    let to_be_delete = app_state.clusters.lock().unwrap().remove(pos);
    let parent = to_be_delete.lock().unwrap().parent.clone();
    parent.lock().unwrap().delete_cluster(to_be_delete.lock().unwrap().name.clone())
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn delete_wave(app_state: tauri::State<AppState>, wave_id: i64) -> Result<(), String> {
    let mut pos = 0;  // 这里又双确信了前端返回的id值有效，因为前端的数据是基于后端的
    for i in 0..app_state.waves.lock().unwrap().len() {
        if app_state.waves.lock().unwrap()[i].lock().unwrap().id == wave_id {
            pos = i;
            break;
        }
    }
    let to_be_delete = app_state.waves.lock().unwrap().remove(pos);
    let parent = to_be_delete.lock().unwrap().parent.clone();
    parent.lock().unwrap().delete_wave(to_be_delete.lock().unwrap().title.clone())
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn rename_origin(app_state: tauri::State<AppState>, id: i64, change_name: String) -> Result<(), String> {
    let mut pos = app_state.origins.lock().unwrap().len();
    for i in 0..app_state.origins.lock().unwrap().len() {
        if app_state.origins.lock().unwrap()[i].lock().unwrap().id == id {
            pos = i;
            break;
        }
    }
    let _ = app_state.origins.lock().unwrap()[pos].lock().unwrap().change_name(change_name);
    Ok(())
}

#[tauri::command]
fn rename_cluster(app_state: tauri::State<AppState>, id: i64, change_name: String) -> Result<(), String> {
    let mut pos = app_state.clusters.lock().unwrap().len();
    for i in 0..app_state.clusters.lock().unwrap().len() {
        if app_state.clusters.lock().unwrap()[i].lock().unwrap().id == id {
            pos = i;
            break;
        }
    }
    let _ = app_state.clusters.lock().unwrap()[pos].lock().unwrap().change_name(change_name);
    Ok(())
}
// 来杯咖啡吗老师？来点Java
#[tauri::command]
fn rename_wave(app_state: tauri::State<AppState>, id: i64, change_name: String) -> Result<(), String> {
    let mut pos = app_state.waves.lock().unwrap().len();
    for i in 0..app_state.waves.lock().unwrap().len() {
        if app_state.waves.lock().unwrap()[i].lock().unwrap().id == id {
            pos = i;
            break;
        }
    }
    let _ = app_state.waves.lock().unwrap()[pos].lock().unwrap().change_name(change_name);
    Ok(())
}

fn main() -> Result<(), OriginMonitorError>{
    let app_state = AppState::new().expect("初始化失败");

    tauri::Builder::default()
    .manage(app_state)
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
    .invoke_handler(tauri::generate_handler![
        get_initial_data, 
        save_file, 
        upload_and_backup_file, 
        create_origin,
        create_cluster,
        create_wave,
        delete_origin,
        delete_cluster,
        delete_wave,
        rename_origin,
        rename_cluster,
        rename_wave,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");

    Ok(())
}