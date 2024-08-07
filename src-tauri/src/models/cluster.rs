// 这里实现Cluster及其方法
use uuid::Uuid;
use origin::Origin;
use note::Wave;

// =============================================================================================================
pub struct Cluster {
    name: String,
    id: Uuid,
    parent: &Origin,
    child: Option<Vec<Wave>>
}

impl Cluster {
    pub fn new(name: String, parent: &Origin) -> Self{
        Cluster {
            name,
            // id要怎么存储和初始化呢，我现在还不知道uuid是怎么用的
            parent,
            child: None,
        }
    }
}


