// 这里实现tsunami(文件管理器)

<<<<<<< Updated upstream
use origin::Origin;
use uuid::Uuid;

pub struct Tsunami {
    id: Uuid,
    master: &Origin,
    cluster_list: HashMap<Uuid, &Cluster>, 
    wave_list: HashMap<Uuid, &Wave>,
    swelling_wave: Option<Uuid>,
}

impl Tsunami {
    
    pub fn init(master: &Origin) -> Self {  
        Tsunami {
            id: uuid::Uuid::new_v4(),
=======
use crate::models::origin::Origin;
use crate::models::cluster::Cluster;
use crate::models::wave::Wave;
use std::collections::HashMap;

pub struct Tsunami<'a> {
    id: usize,
    master: &'a Origin<'a>,
    cluster_list: HashMap<usize, &'a Cluster<'a>>, 
    wave_list: HashMap<usize, &'a Wave<'a>>,
    swelling_wave: Option<usize>,
}

impl<'a> Tsunami<'a> {
    
    pub fn init(id: usize, master: &'a Origin<'a>) -> Self {  
        Tsunami {
            id,
>>>>>>> Stashed changes
            master,
            cluster_list: HashMap::new(),
            wave_list: HashMap::new(),
            swelling_wave: None,
        }
    }

    // 新建cluster方法
<<<<<<< Updated upstream
    pub fn create_cluster(position: &Origin) -> Cluster{
        Cluster::new("未命名".to_string(), position)
=======
    pub fn create_cluster(id: usize, parent: &'a Origin<'a>) -> Cluster<'a>{
        Cluster::new(id, "未命名".to_string(), parent)
>>>>>>> Stashed changes
    }
    
}  

// =============================================================================================================
