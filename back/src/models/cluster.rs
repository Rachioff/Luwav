// 这里实现Cluster及其方法
use uuid::Uuid;
use origin::Origin;
use note::Wave;

// =============================================================================================================
pub struct Cluster {
    name: String,
    id: Uuid,
    parent: &Origin,
    child: Option<Vec<Wave>>,
}

impl Cluster {
    pub fn new(name: String, parent: &Origin) -> Self{
        let id = uuid::Uuid::new_v4();
        Cluster {
            name,
            id,
            parent,
            child: None,
        }
    }
}


