use chrono::{DateTime, Local};
use crate::models::cluster::Cluster;
use app::{OriginMonitor, OriginMonitorError};
use std::sync::{Arc, Mutex};


pub struct Wave {
    pub id: i64,
    pub title: String,
    // pub created_at: DateTime<Local>,
    pub updated_at: DateTime<Local>,
    // pub tags: Vec<String>,
    // pub preview: Option<String>,
    pub monitor: Arc<OriginMonitor>,

    // pub shape: WaveShape,
    pub parent: Arc<Mutex<Cluster>>,
}

impl Wave {
    // 所有方法都会调用monitor相应功能
    pub fn new(parent: Arc<Mutex<Cluster>>) -> Result<Arc<Mutex<Wave>>, OriginMonitorError> {
        let monitor = {parent.lock().unwrap().monitor.clone()};
        let (id, title) = {monitor.create_wave(parent.lock().unwrap().id)?};
        let new_wave = Arc::new(Mutex::new(Wave {
            id,
            title,
            // created_at: chrono::Local::now(),
            updated_at: chrono::Local::now(),
            // tags: vec![],
            // preview: None,
            monitor,

            // shape: WaveShape::Ripple,
            parent: parent.clone(),
        }));
        Ok(new_wave)
    }

    pub fn delete(&mut self) -> Result<(), OriginMonitorError> {
        self.monitor.delete_wave(self.id)?;
        Ok(())
    }

    pub fn change_name(&mut self, change_title: String) -> Result<(), OriginMonitorError>{
        if change_title == self.title {return Ok(())}
        self.updated_at = chrono::Local::now();
        let new_title = self.monitor.change_wave_name(&change_title, self.id)?;
        self.title = new_title;
        Ok(())
    }

    pub fn update(&mut self, new_content: String) -> Result<(), OriginMonitorError> {
        self.updated_at = chrono::Local::now();
        self.monitor.update_wave_content(self.id, new_content)?;
        Ok(())
    }
}

// =============================================================================================================

// pub enum WaveShape {
//     Swell,
//     Ripple,
// }

 