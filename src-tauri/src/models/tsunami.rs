// 这里实现tsunami(文件管理器)

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
            master,
            cluster_list: HashMap::new(),
            wave_list: HashMap::new(),
            swelling_wave: None,
        }
    }

    // 新建cluster方法
    pub fn create_cluster(position: &Origin) -> Cluster{
        Cluster::new("未命名".to_string(), position)
    }
    
}  

// =============================================================================================================
