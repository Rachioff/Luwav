// 这里实现Cluster及其方法
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
use crate::models::origin::Origin;
use crate::models::wave::Wave;

// =============================================================================================================
<<<<<<< Updated upstream
pub struct Cluster {
    name: String,
    id: usize,
    parent: &Origin,
    child: Vec<Wave>,
}

impl Cluster <'a> {
    // 新建Cluster的方法
    pub fn new(id: usize, name: String, parent: &Origin) -> Self{
=======
pub struct Cluster<'a> {
    name: String,
    id: usize,
    parent: &'a Origin<'a>,
    child: Vec<Wave<'a>>,
}

impl<'a> Cluster <'a> {
    // 新建Cluster的方法
    pub fn new(id: usize, name: String, parent: &'a Origin<'a>) -> Self{
>>>>>>> Stashed changes
        Cluster {
            name,
            id,
            parent,
            child: vec![],
        }
    }
}


