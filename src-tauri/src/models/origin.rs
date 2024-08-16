// 这里用于实现Origin以及相关功能

use crate::models::tsunami::Tsunami;
<<<<<<< Updated upstream
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
=======
use crate::models::cluster::Cluster;

// =============================================================================================================

pub struct Origin<'a> {
    id: usize,
    name: String,
    child: Vec<Cluster<'a>>,
    manager: Option<Tsunami<'a>>,
}

impl<'a> Origin<'a> {
    // 新建Origin的方法
    pub fn new(id: usize, name: String) -> Self{
>>>>>>> Stashed changes
        Origin {
            id,
            name,
            child: vec![],
<<<<<<< Updated upstream
            manager: Tsunami::new(),
        }
    }
=======
            manager: None,  // ！！！rust无法在构造的时候互引用，所以在new之后一定要用complete。这种实现可能有点丑陋，之后再改
        }
    }
    // 一定要complete
    pub fn complete(mut self, manager: Tsunami<'a>) {
        self.manager = Some(manager);
    }
>>>>>>> Stashed changes
}