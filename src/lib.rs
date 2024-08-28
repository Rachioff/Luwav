use rusqlite::params;
// use serde::{Serialize, Deserialize};
use lazy_static::lazy_static;
use dirs;
use std::path::PathBuf;
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use thiserror::Error;
use log::{info, error};
use serde_json;

#[derive(Error, Debug)]
pub enum OriginMonitorError {
    #[error("Database error: {0}")]
    DatabaseError(#[from] rusqlite::Error),
    #[error("Pool error: {0}")]
    PoolError(#[from] r2d2::Error),
    #[error("Initialization error: {0}")]
    InitError(String),
    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),
}

type Result<T> = std::result::Result<T, OriginMonitorError>;


// ===========数据库初始化============ //

fn get_database_path() -> PathBuf {
    dirs::data_local_dir()
        .expect("无法找到本地数据路径")
        .join("com.luwavic.luwav")
        .join("luwav_notes.db")
}

fn create_connection_pool() -> Pool<SqliteConnectionManager> {
    let manager = SqliteConnectionManager::file(DB_PATH.as_path());
    Pool::new(manager).expect("无法创建连接池")
}

lazy_static! {
    static ref DB_PATH: PathBuf = get_database_path();
    static ref POOL: Pool<SqliteConnectionManager> = create_connection_pool();
}

// ================================== //

pub struct OriginMonitor {
    pub pool: Pool<SqliteConnectionManager>,
}

impl OriginMonitor {
    pub fn new() -> Result<Self> {
        let pool = POOL.clone();
        let conn = pool.get()?;
        
        conn.execute_batch("
            BEGIN TRANSACTION;
            CREATE TABLE IF NOT EXISTS origins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                clusters_id JSON NOT NULL DEFAULT '[]',
                UNIQUE(name)
            );
            CREATE TABLE IF NOT EXISTS clusters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                origin_id INTEGER NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(origin_id) REFERENCES origins(id),
                UNIQUE(origin_id, name)
            );
            CREATE TABLE IF NOT EXISTS waves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                cluster_id INTEGER NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                tags JSON NOT NULL DEFAULT '[]',
                preview TEXT NOT NULL DEFAULT '',
                content JSON NOT NULL DEFAULT '[]',
                FOREIGN KEY(cluster_id) REFERENCES clusters(id),
                UNIQUE(cluster_id, name)
            );
            CREATE INDEX IF NOT EXISTS idx_clusters_origin_id ON clusters(origin_id);
            CREATE INDEX IF NOT EXISTS idx_waves_cluster_id ON waves(cluster_id);
            CREATE INDEX IF NOT EXISTS idx_waves_content ON waves((json_extract(content, '$.text')));
            COMMIT;
        ").map_err(|e| OriginMonitorError::InitError(format!("无法初始化数据库: {}", e)))?;

        info!("成功初始化数据库");
        Ok(OriginMonitor { pool })
    }

    // 下面这个是防止重名的函数，比较重要
    fn generate_unique_name<F>(&self, base_name: &str, exists_func: F) -> Result<String> 
    where 
        F: Fn(&str) -> Result<bool>,
    {
        let mut attempt = 0;
        loop {
            let name = if attempt == 0 {
                base_name.to_string()
            } else {
                format!("{}-{}", base_name, attempt)
            };

            if !exists_func(&name)? {
                return Ok(name);
            }

            attempt += 1;
            if attempt > 500 {
                return Err(OriginMonitorError::InitError(format!("无法为 '{}' 创建唯一名称", base_name)));
            }
        }
    }

    pub fn create_origin(&self) -> Result<(i64, String)> {
        let conn = self.pool.get()?;

        let new_name = self.generate_unique_name("untitled Origin", 
        |name| {
                let count: i64 = conn.query_row(
                    "SELECT COUNT(*) FROM origins WHERE name = ?", 
                    params![name], 
                    |row| row.get(0)
                )?;
                Ok(count > 0)   
        })?;

        conn.execute(
            "INSERT INTO origins (name) VALUES (?)",
            params![new_name],
        )?;

        let id = conn.last_insert_rowid();
        info!("新建Origin: {}", id);
        Ok((id, new_name))
    }
    
    pub fn create_cluster(&self, origin_id: i64) -> Result<(i64, String)> {
        let conn = self.pool.get()?;

        let new_name = self.generate_unique_name("untitled Cluster",
        |name| {
            let count: i64 = conn.query_row(
                "SELECT COUNT(*) FROM clusters WHERE name = ?1",
                params![name],
                |row| row.get(0)
            )?;
            Ok(count > 0)
        })?;

        conn.execute(
            "INSERT INTO clusters (name, origin_id) VALUES (?, ?)",
            params![new_name, origin_id],
        )?;
        let id = conn.last_insert_rowid();
        info!("新建Cluster: {} in origin: {}", id, origin_id);
        Ok((id, new_name))
    }

    pub fn create_wave(&self, cluster_id: i64) -> Result<(i64, String)> {
        let conn = self.pool.get()?;
        let json_default = r#"
            [
            {
                "type": "heading",
                "content": "你好, 这里是Luwav"
            },
            {
                "type": "paragraph",
                "content": "单击以键入"
            }
            ]
        "#.to_string();

        let new_name = self.generate_unique_name("untitled Wave",
        |name| {
            let count: i64 = conn.query_row(
                "SELECT COUNT(*) FROM waves WHERE name = ?1",
                params![name],
                |row| row.get(0)
            )?;
            Ok(count > 0)
        })?;

        conn.execute(
            "INSERT INTO waves (name, cluster_id, content) VALUES (?, ?, ?)",
            params![new_name, cluster_id, json_default],
        )?;
        let id = conn.last_insert_rowid();
        info!("新建Wave: {} in cluster: {}", id, cluster_id);
        Ok((id, new_name))
    }

    pub fn delete_origin(&self, id: i64) -> Result<()> {
        let conn = self.pool.get()?;
        conn.execute("DELETE FROM origins WHERE id = ?", params![id])?;
        info!("删除Origin: {}", id);
        Ok(())
    }

    pub fn delete_cluster(&self, id: i64) -> Result<()> {
        let conn = self.pool.get()?;
        conn.execute("DELETE FROM clusters WHERE id = ?", params![id])?;
        info!("删除Cluster: {}", id);
        Ok(())
    }

    pub fn delete_wave(&self, id: i64) -> Result<()> {
        let conn = self.pool.get()?;
        conn.execute("DELETE FROM waves WHERE id = ?", params![id])?;
        info!("删除wave: {}", id);
        Ok(())
    }

    pub fn move_cluster_to(&self, from_origin: i64, to_origin: i64, move_cluster: i64) -> Result<()> {
        let conn = self.pool.get()?;
        let rows_affected = conn.execute(
            "UPDATE clusters SET origin_id = ?1 WHERE id = ?2 AND origin_id = ?3",
            params![to_origin, move_cluster, from_origin] 
        )?;

        if rows_affected == 0 {
            return Err(OriginMonitorError::DatabaseError(rusqlite::Error::QueryReturnedNoRows));
        }

        info!("{}中的{}已被转移至{}", from_origin, move_cluster, to_origin);
        Ok(())
    }

    pub fn move_wave_to(&self, from_cluster: i64, to_cluster: i64, move_wave: i64) -> Result<()> {
        let conn = self.pool.get()?;
        let rows_affected = conn.execute(
            "UPDATE waves SET cluster_id = ?1 WHERE id = ?2 AND origin_id = ?3",
            params![to_cluster, move_wave, from_cluster]
        )?;

        if rows_affected == 0 {
            return Err(OriginMonitorError::DatabaseError(rusqlite::Error::QueryReturnedNoRows));
        }

        info!("{}中的{}已经被转移至{}", from_cluster, move_wave, to_cluster);
        Ok(())
    }

    pub fn change_origin_name(&self, changing_name: &str, origin_id: i64) -> Result<String> {
        let conn = self.pool.get()?;

        let new_name = self.generate_unique_name(changing_name,
        |name| {
            let count: i64 = conn.query_row(
                "SELECT COUNT(*) FROM origins WHERE name = ?1",
                params![name],
                |row| row.get(0)
            )?;
            Ok(count > 0)
        })?;

        conn.execute(
            "UPDATE origins SET name = ?1 WHERE id = ?2",
            params![new_name, origin_id],
        )?;
        
        Ok(new_name)
    }

    pub fn change_cluster_name(&self, changing_name: &str, cluster_id: i64) -> Result<String> {
        let conn = self.pool.get()?;

        let new_name = self.generate_unique_name(changing_name,
        |name| {
            let count: i64 = conn.query_row(
                "SELECT COUNT(*) FROM clusters WHERE name = ?1",
                params![name],
                |row| row.get(0)
            )?;
            Ok(count > 0)
        })?;

        conn.execute(
            "UPDATE clusters SET name = ?1 WHERE id = ?2",
            params![new_name, cluster_id],
        )?;
        
        Ok(new_name)
    }

    pub fn change_wave_name(&self, changing_name: &str, wave_id: i64) -> Result<String> {
        let conn = self.pool.get()?;

        let new_name = self.generate_unique_name(changing_name,
        |name| {
            let count: i64 = conn.query_row(
                "SELECT COUNT(*) FROM waves WHERE name = ?1",
                params![name],
                |row| row.get(0)
            )?;
            Ok(count > 0)
        })?;

        conn.execute(
            "UPDATE waves SET name = ?1 WHERE id = ?2",
            params![new_name, wave_id],
        )?;
        
        Ok(new_name)
    }

    pub fn update_wave_content(&self, wave_id: i64, new_content: String) -> Result<()> {
    
        let conn = self.pool.get()?;

        let rows_affected = conn.execute(
            "UPDATE waves SET content = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2", 
            params![new_content, wave_id]
        )?;

        if rows_affected == 0 {
            return Err(OriginMonitorError::DatabaseError(rusqlite::Error::QueryReturnedNoRows));
        }

        info!("更新wave{}: 内容已更新", wave_id);

        Ok(())
    }

}
