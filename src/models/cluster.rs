// 这里实现Cluster及其方法
// 命名不规范，文件名小写然后用下划线连接 nanigdba  xpxpni
// 我好像改不了文件名
use uuid::Uuid;
use origin::Origin;

// =============================================================================================================
struct Cluster {
    name: String,
    id: Uuid,
    parent: Origin,

}

impl Cluster {
    
}


