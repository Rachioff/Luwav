// init.rs

use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use chrono::{DateTime, Local, NaiveDateTime};
use crate::models::origin::Origin;
use crate::models::cluster::Cluster;
use crate::models::wave::Wave;
use app::OriginMonitor;
use app::OriginMonitorError;
use serde::{Serialize, Deserialize};
use anyhow::Result;

#[derive(Serialize, Deserialize)]
pub struct FrontendWave {
    id: String,
    name: String,
    #[serde(rename = "type")]
    type_: String,
}

#[derive(Serialize, Deserialize)]
pub struct FrontendCluster {
    id: String,
    name: String,
    #[serde(rename = "type")]
    type_: String,
    children: Vec<FrontendWave>,
}

#[derive(Serialize, Deserialize)]
pub struct FrontendOrigin {
    id: String,
    name: String,
    #[serde(rename = "type")]
    type_: String,
    children: Vec<FrontendCluster>,
}

pub fn convert_to_frontend_format(app_state: &AppState) -> Result<Vec<FrontendOrigin>> {
    let origins = app_state.origins.lock().unwrap();

    let frontend_origins: Result<Vec<FrontendOrigin>> = origins.iter().map(|origin| {
        let origin_guard = origin.lock().map_err(|e| anyhow::anyhow!("Failed to lock origin: {}", e))?;
        let origin_id = origin_guard.id.to_string();
        let origin_name = origin_guard.name.clone();

        let clusters: Result<Vec<FrontendCluster>> = origin_guard.child.iter().map(|cluster| {
            let cluster_guard = cluster.lock().map_err(|e| anyhow::anyhow!("Failed to lock cluster: {}", e))?;
            let cluster_id = cluster_guard.id.to_string();
            let cluster_name = cluster_guard.name.clone();

            let waves: Vec<FrontendWave> = cluster_guard.child.iter().map(|wave| {
                let wave_guard = wave.lock().unwrap();
                FrontendWave {
                    id: wave_guard.id.to_string(),
                    name: wave_guard.title.clone(),
                    type_: "wave".to_string(),
                }
            }).collect();

            Ok(FrontendCluster {
                id: cluster_id,
                name: cluster_name,
                type_: "cluster".to_string(),
                children: waves,
            })
        }).collect();

        Ok(FrontendOrigin {
            id: origin_id,
            name: origin_name,
            type_: "origin".to_string(),
            children: clusters?,
        })
    }).collect();

    frontend_origins
}

pub struct AppState {
    pub origins: Mutex<Vec<Arc<Mutex<Origin>>>>,
    pub hash_origins: Mutex<HashMap<i64, Arc<Mutex<Origin>>>>,
    pub hash_clusters: Mutex<HashMap<i64, Arc<Mutex<Cluster>>>>,
    pub hash_waves: Mutex<HashMap<i64, Arc<Mutex<Wave>>>>,
    pub monitor: Arc<OriginMonitor>,
}

impl AppState {
    pub fn new() -> Result<Self, OriginMonitorError> {
        let monitor = Arc::new(OriginMonitor::new()?);
        let origins = Mutex::new(load_origins(&monitor)?); 
    
        let mut hash_origins: HashMap<i64, Arc<Mutex<Origin>>> = HashMap::new();
        let mut hash_clusters: HashMap<i64, Arc<Mutex<Cluster>>> = HashMap::new();
        let mut hash_waves: HashMap<i64, Arc<Mutex<Wave>>> = HashMap::new();
        for origin in origins.lock().unwrap().iter() {
            hash_origins.insert(origin.lock().unwrap().id, origin.clone());
            for cluster in origin.lock().unwrap().child.iter() {
                hash_clusters.insert(cluster.lock().unwrap().id, cluster.clone());
                for wave in cluster.lock().unwrap().child.iter(){
                    hash_waves.insert(wave.lock().unwrap().id, wave.clone());
                }
            }
        }
        let hash_origins = Mutex::new(hash_origins);
        let hash_clusters = Mutex::new(hash_clusters);
        let hash_waves = Mutex::new(hash_waves);

        Ok(AppState { origins, hash_origins, hash_clusters, hash_waves, monitor })
    }
}

fn parse_datetime(s: String) -> Result<DateTime<Local>, OriginMonitorError> {
    let naive = NaiveDateTime::parse_from_str(&s, "%Y-%m-%d %H:%M:%S")
        .map_err(|e| OriginMonitorError::InitError(format!("DateTime parse error: {}", e)))?;
    Ok(DateTime::from_naive_utc_and_offset(naive, Local::now().offset().clone()))
}

fn load_origins(monitor: &Arc<OriginMonitor>) -> Result<Vec<Arc<Mutex<Origin>>>, OriginMonitorError> {
    let conn = monitor.pool.get()?;
    let mut stmt = conn.prepare("SELECT id, name FROM origins")?;
    let origin_iter = {stmt.query_map([], |row| {
        Ok((row.get(0)?, row.get(1)?))
    })?};

    let mut origins = Vec::new();
    for origin_result in origin_iter {
        let (id, name): (i64, String) = origin_result?;
        // let created_at = parse_datetime(created_at_str)?;
        let origin = Arc::new(Mutex::new(Origin {
            id,
            name,
            // created_at,
            child: Vec::new(),
            monitor: monitor.clone(),
        }));
        load_clusters(&origin, monitor)?;
        origins.push(origin);
    }

    Ok(origins)
}

fn load_clusters(origin: &Arc<Mutex<Origin>>, monitor: &Arc<OriginMonitor>) -> Result<(), OriginMonitorError> {
    let conn = monitor.pool.get()?;
    let mut stmt = conn.prepare("SELECT id, name FROM clusters WHERE origin_id = ?")?;
    let cluster_iter = {stmt.query_map([origin.lock().unwrap().id], |row| {
        Ok((row.get(0)?, row.get(1)?))
    })?};

    for cluster_result in cluster_iter {
        let (id, name): (i64, String) = cluster_result?;
        // let created_at = parse_datetime(created_at_str)?;
        let cluster = Arc::new(Mutex::new(Cluster {
            id,
            name,
            // created_at,
            parent: origin.clone(),
            child: Vec::new(),
            monitor: monitor.clone(),
        }));
        load_waves(&cluster, monitor)?;
        {origin.lock().unwrap().child.push(cluster)};
    }

    Ok(())
}

fn load_waves(cluster: &Arc<Mutex<Cluster>>, monitor: &Arc<OriginMonitor>) -> Result<(), OriginMonitorError> {
    let conn = monitor.pool.get()?;
    let mut stmt = conn.prepare("SELECT id, name, updated_at FROM waves WHERE cluster_id = ?")?;
    let wave_iter = {stmt.query_map([cluster.lock().unwrap().id], |row| {
        Ok((
            row.get(0)?,
            row.get(1)?,
            row.get(2)?,
        ))
    })?};
    
    for wave_result in wave_iter {
        let (id, title, updated_at_str): (i64, String, String) = wave_result?;
        // let created_at = parse_datetime(created_at_str)?;
        let updated_at = parse_datetime(updated_at_str)?;
        // let tags: Vec<String> = serde_json::from_str(&tags)?;
        let wave = Arc::new(Mutex::new(Wave {
            id,
            title,
            // created_at,
            updated_at,
            // tags,
            // preview,
            monitor: monitor.clone(),
            // shape: WaveShape::Ripple,
            parent: cluster.clone(),
        }));
        cluster.lock().unwrap().child.push(wave);
    }

    Ok(())
}