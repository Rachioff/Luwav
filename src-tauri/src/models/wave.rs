// 实现 note

// 2024/8/6 16:03
// 笔记管理系统按三层：Origins/Clusters/Waves

use chrono::{DateTime, Local};
use serde::{Deserialize, Serialize};



#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Wave {
    pub frequency: WaveMetadata,
    pub shape: WaveShape,
    pub parent: &Cluster,
}

// =============================================================================================================

#[derive(Serialize, Deserialize, Debug, Clone)]
enum WaveShape {
    Swell(WaveContent), // 用于表示正在编辑的Wave，会有内容
    Ripple, // 用于表示不在编辑的Wave，没有内容只有元数据
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WaveMetadata {
    pub id: Uuid, 
    pub title: String, // title: 笔记标题
    pub created_at: DateTime<Local>, // created_at: 笔记创建时间
    pub updated_at: DateTime<Local>, // updated_at: 笔记更新时间
    pub tags: Option<Vec<String>>, // tags: 用户自定tag，通过tag可以浏览所有具有相同tag的笔记
    pub preview: Option<String>, // preview: 文件预览，用于笔记预览
}

impl WaveMetadata {
    pub fn init_data() -> Self {
        let id = uuid::Uuid::new_v4();
        Wavemetadata {
            id,
            title: "Untitled".to_string(),
            tags: None,
            created_at: chrono::Local::now(),
            updated_at: chrono::Local::now(),
            preview: None,
        }
    }
}

// =============================================================================================================

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WaveContent {
    pub content: String, // content: 笔记内容
    // xxy: 这里可能需要看一下Plate.js的文档，我不清楚需要怎么写
    // xxy: 可能不能简单的String，可能是一个更复杂的结构体，先这样吧

    //zsy: 这里可以存放文件指针，然后实现一个打开文件的方法。
}

impl WaveContent {
    pub fn open_file() {
        // 打开文件
    }
}

// =============================================================================================================
 