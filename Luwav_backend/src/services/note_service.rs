use crate::models::{Note, NoteMetadata, Wave, WaveContent, WaveMetadata};
use uuid::Uuid;
use chrono::{DateTime, Local};

pub struct Tsunami {
    id: Uuid,
    storage: Box<dyn WaveStorage>,
}

pub trait WaveStorage {
    fn save_note(&self, note: &Note) -> Result<(), Box<dyn std::error::Error>>;
    fn load_note(&self, id: &Uuid) -> Result<Note, Box<dyn std::error::Error>>;
    fn delete_note(&self, id: &Uuid) -> Result<(), Box<dyn std::error::Error>>;
    fn list_notes(&self) -> Result<Vec<NoteMetadata>, Box<dyn std::error::Error>>;
}

impl Tsunami {
    pub fn new(storage: Box<dyn WaveStorage>) -> Self {
        Self { 
            id: uuid::Uuid::new_v4(), 
            storage 
        }
    }

    
    pub fn create_note(&self, parent_id: Uuid, shape: WaveContent) -> Result<Uuid, Box<dyn std::error::Error>> {
        let id = uuid::Uuid::new_v4();
        let note = Wave {
            metadata: WaveMetadata {
                id,
                parent_id,
                title: "Untitled".to_string(),
                tags: vec![],
                created_at: chrono::Local::now(),
                updated_at: chrono::Local::now(),
            },
            shape,
        };
        self.storage.save_note(&note)?;
        Ok(id)
    }

    pub fn get_note(&self, id: &Uuid) -> Result<Note, Box<dyn std::error::Error>> {
        self.storage.load_note(id)
    }

    // 其他方法...
}