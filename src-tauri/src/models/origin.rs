// 这里用于实现Origin以及相关功能

use crate::models::tsunami::Tsunami;
use cluster::Cluster;
use note::Wave;

// =============================================================================================================

pub struct Origin {
    id: usize,
    name: String,
    child: Vec<Cluster>,
    manager: Tsunami,
}

impl Origin {
    // 新建Origin的方法
    pub fn new(id:usize, name: String) -> Self{
        Origin {
            id,
            name,
            child: vec![],
            manager: Tsunami::new(),
        }
    }
}