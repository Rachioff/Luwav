use crate::models::{Wave, WaveContent, WaveMetadata, Cluster, Origin};
use uuid::Uuid;
use chrono::{DateTime, Local};

pub struct Tsunami {
    id: Uuid,
    storage: Box<dyn WaveStorage>,
}
// 下午好，现在是北京时间14:58
// 公元2024年8月6日
pub trait WaveStorage {
    fn save_note(&self, note: &Note) -> Result<(), Box<dyn std::error::Error>>;
    fn load_note(&self, id: &Uuid) -> Result<Wave, Box<dyn std::error::Error>>;
    fn delete_note(&self, id: &Uuid) -> Result<(), Box<dyn std::error::Error>>;
    fn list_notes(&self) -> Result<Vec<WaveMetadata>, Box<dyn std::error::Error>>;
}

impl Tsunami {
    pub fn new(storage: Box<dyn WaveStorage>) -> Self {
        Self { 
            id: uuid::Uuid::new_v4(), 
            storage, 
        }
    }

    
    pub fn create_wave(&self, shape: WaveContent, parent: &Cluster) -> Result<Uuid, Box<dyn std::error::Error>> {
        let id = uuid::Uuid::new_v4();
        let wave = Wave {
            frequency: Wavemetadata::init_data(),
            shape: WaveShape::Swell(WaveContent { content: "".to_string() }),
            parent,
        };
        self.storage.save_wave(&wave)?;
        Ok(id)
    }

    pub fn create_cluster() {
        
    }

    pub fn get_note(&self, id: &Uuid) -> Result<Note, Box<dyn std::error::Error>> {
        self.storage.load_note(id)
    }

    // 其他方法...
}