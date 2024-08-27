// 这里用于实现Origin以及相关功能

use crate::models::cluster::Cluster;
use log::error;
use app::{OriginMonitor, OriginMonitorError};
use std::sync::{Arc, Mutex};
// use chrono::{DateTime, Local};

// =============================================================================================================

pub struct Origin {
    pub id: i64,
    pub name: String,
    // pub created_at: DateTime<Local>,
    pub child: Vec<Arc<Mutex<Cluster>>>,
    pub monitor: Arc<OriginMonitor>,
}

impl Origin {

    // 由于有多个cluster需要引用Origin，所以使用计数指针
    pub fn new(monitor: Arc<OriginMonitor>) -> Result<Arc<Mutex<Self>>, OriginMonitorError> {
        let (id, name) = monitor.create_origin()?;
        let new_origin = Arc::new(Mutex::new(Origin {
            id,
            name,
            // created_at: chrono::Local::now(),
            child: vec![],
            monitor: monitor.clone(),
        }));

        Ok(new_origin)
    }

    pub fn delete(&mut self) -> Result<(), OriginMonitorError> {
        for del in self.child.iter_mut() {
            // 清理cluster的数据库数据
            del.lock().unwrap().delete()?;
        }
        self.monitor.delete_origin(self.id)?;
        Ok(())
    }
    
    pub fn create_cluster(parent: Arc<Mutex<Self>>) -> Result<Arc<Mutex<Cluster>>, OriginMonitorError>{
        let new_cluster = Cluster::new(parent.clone())?;
        parent.lock().unwrap().child.push(new_cluster.clone());
        Ok(new_cluster)
    }
    
    pub fn delete_cluster(&mut self, target: String) -> Result<(), OriginMonitorError> {
        let pos = self.child.iter().position(|del| {
            if let Ok(cluster) = del.try_lock() {
                cluster.name == target
            } else {
                false
            }
        });
        
        if let Some(pos) = pos {
            let removed_cluster = self.child.remove(pos);
            {
                let mut cluster = removed_cluster.lock().unwrap();
                cluster.delete()?;
            }
        } else {
            error!("未找到目标Cluster: {}", target);
        }
        
        Ok(())
    }

    // pub fn move_cluster_to(
    //     from_origin: Arc<Mutex<Origin>>, 
    //     to_origin: Arc<Mutex<Origin>>, 
    //     move_cluster: Arc<Mutex<Cluster>>
    // ) -> Result<(), OriginMonitorError> {
    //     let cluster_id;
    //     let from_origin_id;
    //     let to_origin_id;

    //     {
    //         let from_origin_ref = from_origin.lock().unwrap();
    //         from_origin_id = from_origin_ref.id;
    //         let to_origin_ref = to_origin.lock().unwrap();
    //         to_origin_id = to_origin_ref.id;
    //         cluster_id = move_cluster.lock().unwrap().id;
    //     }

    //     {
    //         let mut from_origin_mut = from_origin.lock().unwrap();
    //         if let Some(pos) = from_origin_mut.child.iter().position(|rem| 
    //             rem.lock().unwrap().id == cluster_id) {
    //             from_origin_mut.child.remove(pos);
    //         } else {
    //             error!("未找到目标Cluster: {}", move_cluster.lock().unwrap().name);
    //             return Err(OriginMonitorError::InitError("未找到目标Cluster".to_string()));
    //         }
    //     }

    //     {
    //         let mut to_origin_mut = to_origin.lock().unwrap();
    //         to_origin_mut.child.push(move_cluster.clone());
    //     }
        
    //     from_origin.lock().unwrap().monitor.move_cluster_to(
    //         from_origin_id,
    //         to_origin_id,
    //         cluster_id,
    //     )?;

    //     Ok(())
    // }

    pub fn change_name(&mut self, change_name: String) -> Result<(), OriginMonitorError>{
        if change_name == self.name {return Ok(())}
        let new_name = self.monitor.change_origin_name(&change_name, self.id)?;
        self.name = new_name;
        Ok(())
    }

    // pub fn sort_cluster(&mut self, sort_mode: i64, order: i64) {
    //     // sort_mode  1： 默认创建时间 2：按字典序
    //     // order  1：升序 2：降序

    //     if sort_mode == 2 {
    //         self.child.sort_by(|a, b| a.lock().unwrap().name.cmp(&b.lock().unwrap().name));
    //     } else if sort_mode != 1 { error!("无效的排序方法: {}", sort_mode); }

    //     if order == 2 {
    //         self.child.reverse();
    //     } else if order != 1 {
    //         error!("无效的排序顺序: {}", order);
    //     }

    // }

}