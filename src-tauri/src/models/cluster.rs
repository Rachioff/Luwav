// 这里实现Cluster及其方法
use crate::models::origin::Origin;
use crate::models::wave::Wave;

// =============================================================================================================
pub struct Cluster {
    name: String,
    id: usize,
    parent: &Origin,
    child: Vec<Wave>,
}

impl Cluster <'a> {
    // 新建Cluster的方法
    pub fn new(id: usize, name: String, parent: &Origin) -> Self{
        Cluster {
            name,
            id,
            parent,
            child: vec![],
        }
    }
}


