// 实现note

struct Note {
    id: usize,
    name: String,
    // tag: 用户自定tag，通过tag可以浏览所有具有相同tag的笔记
    // date: 时间的实现

}


impl Note {
    
}

// 这个我刚刚在想 不要那么直白地放在src下面
// 会不会好一些   

// 啥意思 还能放在哪  刚刚在看圣经   没看到  你应该是不能在我这创建文件夹的 你只能编辑文档
// 啊哦 似乎尝试了一些不该尝试的。没事你可以看看我刚刚创建的文件

// 这个路径：/Luwav_backend/project_structure

// how about this ↓↓↓
// note-app/
// ├── src/
// │   ├── main.rs               # Rust主程序入口点
// │   ├── lib.rs                # Rust库代码
// │   ├── models/
// │   │   └── note.rs           # 笔记数据模型
// │   ├── services/
// │   │   ├── file_service.rs   # 文件操作服务
// │   │   └── note_service.rs   # 笔记业务逻辑服务
// │   └── utils/
// │       └── error.rs          # 错误处理工具
// ├── ui/
// │   ├── src/
// │   │   ├── components/
// │   │   │   ├── Editor.jsx    # Plate.js编辑器组件
// │   │   │   ├── NoteList.jsx  # 笔记列表组件
// │   │   │   └── Sidebar.jsx   # 侧边栏组件
// │   │   ├── hooks/
// │   │   │   └── useNotes.js   # 笔记相关的自定义Hook
// │   │   ├── utils/
// │   │   │   └── tauri-api.js  # 与Tauri后端通信的工具函数
// │   │   ├── App.jsx           # React主组件
// │   │   └── index.jsx         # React入口文件
// │   ├── public/
// │   │   └── index.html        # HTML模板
// │   └── package.json          # 前端依赖配置
// ├── Cargo.toml                # Rust依赖配置
// ├── tauri.conf.json           # Tauri配置文件
// └── README.md                 # 项目说明文档