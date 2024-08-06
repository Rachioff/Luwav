use models::note::Wave;
use chrono::{DateTime, Local};

// =============================================================================================================

pub struct File {
    title: String,
    waves: Option<Vec<Wave>>,
    pointers: Option<Vec<&Self>>,
    updated_at: DateTime<Local>,
}
// 过来看看你，
// 我follow了你，导致我刚刚一直乱跳
// wait，你这个结构体和NoteManager有什么区别？
// 这个是文件夹    dictionary
impl File {
    pub fn new(title: String, file_path: String) -> Self{
        let now = Local::now();
        File {
            updated_at: now,
            title,
            waves: None,
            pointers: None,
        }
    }

    pub fn create_new_wave() {

    }
}
// 可是它总得能加入新的wave吧
// 等一下这应该是Tsunami
// =============================================================================================================


// 算了你先写吧，我不是很会这些
// 


// 你想要一个什么样的结果

// 但是不同的路径可能有相同的文件名。
// 这样不是需要遍历所有文件夹
// 会的，也许是“未命名”
// 啊对的，我的意思是不同路径下的文件名一样，同一路径下文件名一样的话，会被认为是同一个文件
// 现在的问题就是如何在软件的文件浏览的界面点击一个文件，能够在编辑器中打开这个文件
// 点击这个文件以后传递一个什么信号或者信息可以让程序知道这个文件的id，然后从HashMap中取出这个文件，然后打开
// 我之前想的是用路径作为key，这样点击的那个文件一定可以传回文件的路径，也就可以直接找到HashMap中的这个文件
// 好像已经有了，不过我想把它当成id -> 在note.rs 的第21行
// 可能，你需要设计一个文件存储的结构体。我们不按照电脑的文件管理系统来存储可以吗
