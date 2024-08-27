// init.rs

use std::sync::{Arc, Mutex};
use chrono::{DateTime, Local, NaiveDateTime};
use crate::models::origin::Origin;
use crate::models::cluster::Cluster;
use crate::models::wave::{Wave, WaveShape};
use app::OriginMonitor;
use app::OriginMonitorError;
use serde_json;
use serde::{Serialize, Deserialize};
use anyhow::Result;

#[derive(Serialize, Deserialize)]
pub struct FrontendWave {
    id: String,
    name: String,
    #[serde(rename = "type")]
    type_: String,
    content: serde_json::Value,
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
    let origins = app_state.origins.lock().unwrap().iter().map(|origin| {
        let origin_guard = origin.lock().map_err(|e| anyhow::anyhow!("Failed to lock origin: {}", e))?;
        let clusters = origin_guard.child.iter().map(|cluster| {
            let cluster_guard = cluster.lock().map_err(|e| anyhow::anyhow!("Failed to lock cluster: {}", e))?;
            Ok(FrontendCluster {
                id: cluster_guard.id.to_string(),
                name: cluster_guard.name.clone(),
                type_: "cluster".to_string(),
                children: cluster_guard.child.iter().map(|wave| {
                    FrontendWave {
                        id: wave.lock().unwrap().id.to_string(),
                        name: wave.lock().unwrap().title.clone(),
                        type_: "wave".to_string(),
                        content: serde_json::json!({}),
                    }
                }).collect(),
            })
        }).collect::<Result<Vec<_>>>()?;

        Ok(FrontendOrigin {
            id: origin_guard.id.to_string(),
            name: origin_guard.name.clone(),
            type_: "origin".to_string(),
            children: clusters,
        })
    }).collect::<Result<Vec<_>>>()?;

    Ok(origins)
}

pub struct AppState {
    pub origins: Mutex<Vec<Arc<Mutex<Origin>>>>,
    pub clusters: Mutex<Vec<Arc<Mutex<Cluster>>>>,
    pub waves: Mutex<Vec<Arc<Mutex<Wave>>>>,
    pub monitor: Arc<OriginMonitor>,
}

impl AppState {
    pub fn new() -> Result<Self, OriginMonitorError> {
        let monitor = Arc::new(OriginMonitor::new()?);
        let origins = Mutex::new(load_origins(&monitor)?);
        let clusters = Mutex::new(vec![]);
        for origin in origins.lock().unwrap().iter() {
            clusters.lock().unwrap().extend(origin.lock().unwrap().child.clone());
        }
        let waves = Mutex::new(vec![]);
        for cluster in clusters.lock().unwrap().iter() {
            waves.lock().unwrap().extend(cluster.lock().unwrap().child.clone())
        }
        Ok(AppState { origins, clusters, waves, monitor })
    }
}

fn parse_datetime(s: String) -> Result<DateTime<Local>, OriginMonitorError> {
    let naive = NaiveDateTime::parse_from_str(&s, "%Y-%m-%d %H:%M:%S")
        .map_err(|e| OriginMonitorError::InitError(format!("DateTime parse error: {}", e)))?;
    Ok(DateTime::from_naive_utc_and_offset(naive, Local::now().offset().clone()))
}

fn load_origins(monitor: &Arc<OriginMonitor>) -> Result<Vec<Arc<Mutex<Origin>>>, OriginMonitorError> {
    let conn = monitor.pool.get()?;
    let mut stmt = conn.prepare("SELECT id, name, created_at FROM origins")?;
    let origin_iter = stmt.query_map([], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?))
    })?;

    let mut origins = Vec::new();
    for origin_result in origin_iter {
        let (id, name, created_at_str): (i64, String, String) = origin_result?;
        let created_at = parse_datetime(created_at_str)?;
        let origin = Arc::new(Mutex::new(Origin {
            id,
            name,
            created_at,
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
    let mut stmt = conn.prepare("SELECT id, name, created_at FROM clusters WHERE origin_id = ?")?;
    let cluster_iter = stmt.query_map([origin.lock().unwrap().id], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?))
    })?;

    for cluster_result in cluster_iter {
        let (id, name, created_at_str): (i64, String, String) = cluster_result?;
        let created_at = parse_datetime(created_at_str)?;
        let cluster = Arc::new(Mutex::new(Cluster {
            id,
            name,
            created_at,
            parent: origin.clone(),
            child: Vec::new(),
            monitor: monitor.clone(),
        }));
        load_waves(&cluster, monitor)?;
        origin.lock().unwrap().child.push(cluster);
    }

    Ok(())
}

fn load_waves(cluster: &Arc<Mutex<Cluster>>, monitor: &Arc<OriginMonitor>) -> Result<(), OriginMonitorError> {
    let conn = monitor.pool.get()?;
    let mut stmt = conn.prepare("SELECT id, name, created_at, updated_at, tags, preview FROM waves WHERE cluster_id = ?")?;
    let wave_iter = stmt.query_map([cluster.lock().unwrap().id], |row| {
        Ok((
            row.get(0)?,
            row.get(1)?,
            row.get(2)?,
            row.get(3)?,
            row.get(4)?,
            row.get(5)?,
        ))
    })?;

    for wave_result in wave_iter {
        let (id, title, created_at_str, updated_at_str, tags, preview): (i64, String, String, String, String, Option<String>) = wave_result?;
        let created_at = parse_datetime(created_at_str)?;
        let updated_at = parse_datetime(updated_at_str)?;
        let tags: Vec<String> = serde_json::from_str(&tags)?;
        let wave = Arc::new(Mutex::new(Wave {
            id,
            title,
            created_at,
            updated_at,
            tags,
            preview,
            monitor: monitor.clone(),
            shape: WaveShape::Ripple,
            parent: cluster.clone(),
        }));
        cluster.lock().unwrap().child.push(wave);
    }

    Ok(())
}