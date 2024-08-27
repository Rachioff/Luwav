#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::fs;
use app::OriginMonitorError;
use tauri::Manager;
use std::path::Path;
use std::path::PathBuf;
use sha2::{Sha256, Digest};

use mime_guess::from_path;
use mime_guess::mime;
use log::{info, error};

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

// #[tauri::command] // 以下是之前为了将URL图片下载下来写的，不过后来发现是协议的问题，这个还有没有用已经忘记了，到时候测试一下
// async fn proxy_image(url: String) -> Result<Vec<u8>, String> {
//     let resp = reqwest::get(&url).await.map_err(|e| e.to_string())?;
//     let bytes = resp.bytes().await.map_err(|e| e.to_string())?;
//     Ok(bytes.to_vec())
// }

#[tauri::command]
fn get_initial_data(state: tauri::State<AppState>) -> Result<Vec<FrontendOrigin>, String> {
    convert_to_frontend_format(&state).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_origin(app_state: tauri::State<AppState>) -> Result<(), String> {
    let new_origin = Origin::new(app_state.monitor.clone()).map_err(|e| e.to_string())?;
    let origin_id = new_origin.lock().unwrap().id;

    {
        let mut origins = app_state.origins.lock().unwrap();
        origins.push(new_origin.clone());
    }

    {
        let mut hash_origins = app_state.hash_origins.lock().unwrap();
        hash_origins.insert(origin_id, new_origin);
    }

    Ok(())
}

#[tauri::command]
fn create_cluster(app_state: tauri::State<AppState>, origin_id: i64) -> Result<(), String> {
    let parent = {
        let hash_origins = app_state.hash_origins.lock().unwrap();
        hash_origins.get(&origin_id).cloned().ok_or("未找到Origin")?
    };

    let new_cluster = Origin::create_cluster(parent).map_err(|e| e.to_string())?;
    let cluster_id = new_cluster.lock().unwrap().id;

    {
        let mut hash_clusters = app_state.hash_clusters.lock().unwrap();
        hash_clusters.insert(cluster_id, new_cluster);
    }

    Ok(())
}

#[tauri::command]
fn create_wave(app_state: tauri::State<AppState>, cluster_id: i64) -> Result<(), String> {
    let parent = {
        let hash_clusters = app_state.hash_clusters.lock().unwrap();
        hash_clusters.get(&cluster_id).cloned().ok_or("未找到Cluster")?
    };

    let new_wave = Cluster::create_wave(parent).map_err(|e| e.to_string())?;
    let wave_id = {new_wave.lock().unwrap().id};
    
    {
        let mut hash_waves = app_state.hash_waves.lock().unwrap();
        hash_waves.insert(wave_id, new_wave);
    }
    Ok(())
}

#[tauri::command]
fn delete_origin(app_state: tauri::State<AppState>, origin_id: i64) -> Result<(), String> {

    let to_be_delete = {
        let hash_origins = app_state.hash_origins.lock().unwrap();
        hash_origins.get(&origin_id).cloned().ok_or("Origin not found")?
    };

    {
        let mut origins = app_state.origins.lock().unwrap();
        origins.retain(|origin| origin.lock().unwrap().id != origin_id);
    }

    {
        let mut hash_origins = app_state.hash_origins.lock().unwrap();
        hash_origins.remove(&origin_id);
    }

    to_be_delete.lock().unwrap().delete().map_err(|e| e.to_string())?;

    Ok(())
}

// log: 要注意死锁问题!!
#[tauri::command]
fn delete_cluster(app_state: tauri::State<AppState>, cluster_id: i64) -> Result<(), String> {
    // 1. 获取需要的信息，但不持有锁
    let (parent, cluster_name) = {
        let clusters = app_state.hash_clusters.lock().unwrap();
        let cluster = clusters.get(&cluster_id).ok_or("查询失败")?;
        let cluster_guard = cluster.lock().unwrap();
        (cluster_guard.parent.clone(), cluster_guard.name.clone())
    };

    // 2. 从 hash_clusters 中删除
    {
        let mut clusters = app_state.hash_clusters.lock().unwrap();
        clusters.remove(&cluster_id);
    }

    // 3. 调用 parent 的 delete_cluster 方法
    parent.lock().unwrap().delete_cluster(cluster_name).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn delete_wave(app_state: tauri::State<AppState>, wave_id: i64) -> Result<(), String> {
    let (parent, wave_name) = {
        let waves = app_state.hash_waves.lock().unwrap();
        let wave = waves.get(&wave_id).ok_or("查询失败")?;
        let wave_guard = wave.lock().unwrap();
        (wave_guard.parent.clone(), wave_guard.title.clone())
    };

    {
        let mut waves = app_state.hash_waves.lock().unwrap();
        waves.remove(&wave_id);
    }
    
    parent.lock().unwrap().delete_wave(wave_name).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn rename_origin(app_state: tauri::State<AppState>, id: i64, change_name: String) -> Result<(), String> {
    app_state.hash_origins.lock().unwrap()[&id].lock().unwrap().change_name(change_name).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn rename_cluster(app_state: tauri::State<AppState>, id: i64, change_name: String) -> Result<(), String> {
    app_state.hash_clusters.lock().unwrap()[&id].lock().unwrap().change_name(change_name).map_err(|e| e.to_string())?;
    Ok(())
}
// 来杯咖啡吗老师？来点Java
#[tauri::command]
fn rename_wave(app_state: tauri::State<AppState>, id: i64, change_name: String) -> Result<(), String> {
    app_state.hash_waves.lock().unwrap()[&id].lock().unwrap().change_name(change_name).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn update_wave(app_state: tauri::State<AppState>, id: i64, new_content: String) -> Result<(), String> {
    let target_wave = {app_state.hash_waves.lock().unwrap()[&id].clone()};
    target_wave.lock().unwrap().update(new_content).map_err(|e| e.to_string())?;
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
        update_wave,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");

    Ok(())
}