// 这里实现Cluster及其方法
use crate::models::origin::Origin;
use crate::models::wave::Wave;
use log::error;
use app::{OriginMonitor, OriginMonitorError};
use std::sync::{Arc, Mutex};
use chrono::{ DateTime, Local };

// =============================================================================================================
pub struct Cluster {
    pub name: String,
    pub id: i64,
    pub created_at: DateTime<Local>,
    pub parent: Arc<Mutex<Origin>>,
    pub child: Vec<Arc<Mutex<Wave>>>,
    pub monitor: Arc<OriginMonitor>,
}

impl Cluster {
    
    pub fn new(parent: Arc<Mutex<Origin>>) 
    -> Result<Arc<Mutex<Cluster>>, OriginMonitorError> {
        let monitor = parent.lock().unwrap().monitor.clone();
        let (id, name) = monitor.create_cluster(parent.lock().unwrap().id)?;
        let new_cluster = Arc::new(Mutex::new(Cluster {
            name,
            id,
            created_at: chrono::Local::now(),
            parent: parent.clone(),
            child: vec![],
            monitor,
        }));

        Ok(new_cluster)
    }

    pub fn delete(&mut self) -> Result<(), OriginMonitorError> {
        for del in self.child.iter_mut() {
            del.lock().unwrap().delete()?; // 为了清理wave数据库数据
        }
        self.monitor.delete_cluster(self.id)?;
        Ok(())
    }

    pub fn create_wave(parent: Arc<Mutex<Self>>) -> Result<Arc<Mutex<Wave>>, OriginMonitorError> {
        let new_wave = Wave::new(parent.clone())?;
        parent.lock().unwrap().child.push(new_wave.clone());
        Ok(new_wave) 
    }
    
    pub fn delete_wave(&mut self, target: String) -> Result<(), OriginMonitorError> {
        if let Some(pos) = self.child.iter().position(|del| del.lock().unwrap().title == target){
            let to_be_delete = self.child.remove(pos);
            println!("the title of deleted wave is {}", to_be_delete.lock().unwrap().title);
            to_be_delete.lock().unwrap().delete()?;
            drop(to_be_delete);
        } else {
            error!("未找到目标笔记: {}", target);
        }

        Ok(())
    }

    pub fn move_wave_to(
        from_cluster: Arc<Mutex<Cluster>>, 
        to_cluster: Arc<Mutex<Cluster>>, 
        move_wave: Arc<Mutex<Wave>>) 
    -> Result<(), OriginMonitorError> {
        let wave_id = move_wave.lock().unwrap().id;

        if let Some(pos) = from_cluster.lock().unwrap().child.iter().position(|rem| {
            move_wave.lock().unwrap().id == rem.lock().unwrap().id
        }) {
            from_cluster.lock().unwrap().child.remove(pos);
        } else {
            error!("未找到目标Wave: {}", move_wave.lock().unwrap().title);
        }
        to_cluster.lock().unwrap().child.push(move_wave);
        
        app::OriginMonitor::move_wave_to(
            &from_cluster.lock().unwrap().monitor, 
            from_cluster.lock().unwrap().id, 
            to_cluster.lock().unwrap().id, 
            wave_id,
        )?;

        Ok(())
    }

    pub fn change_name(&mut self, change_name: String) -> Result<(), OriginMonitorError>{
        let new_name = self.monitor.change_cluster_name(&change_name, self.id)?;
        self.name = new_name;
        Ok(())
    }

    pub fn sort_wave(&mut self, sort_mode: i64, order: i64) {
        // sort_mode  1： 默认创建时间 2：按字典序
        // order  1：升序 2：降序
        
        if sort_mode == 2 {
            self.child.sort_by(|a, b| a.lock().unwrap().title.cmp(&b.lock().unwrap().title));
        } else if sort_mode != 1 { error!("无效的排序方法: {}", sort_mode); }

        if order == 2 {
            self.child.reverse();
        } else if order != 1 {
            error!("无效的排序顺序: {}", order);
        }
        
    }

}
