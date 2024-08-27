import React, { useState, useEffect, useCallback} from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { invoke } from '@tauri-apps/api/tauri';

interface FrontendWave {
  id: string;
  name: string;
  type: 'wave';
  content: any;
}

interface FrontendCluster {
  id: string;
  name: string;
  type: 'cluster';
  children: FrontendWave[];
}

interface FrontendOrigin {
  id: string;
  name: string;
  type: 'origin';
  children: FrontendCluster[];
}

type TreeNode = FrontendOrigin | FrontendCluster | FrontendWave;

interface SidebarProps {
  data: FrontendOrigin[];
  onDataChange: (newData: FrontendOrigin[]) => void;
  refreshData: () => Promise<void>;
}

interface ContextMenuProps {
  x: number;
  y: number;
  options: { label: string; action: () => void }[];
}

const useContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<ContextMenuProps | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenu && !(event.target as Element).closest('.context-menu')) {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

  return { contextMenu, setContextMenu };
};

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, options }) => (
  <div 
    className="context-menu" 
    style={{ position: 'fixed', top: y, left: x, backgroundColor: 'white', border: '1px solid black', zIndex: 1000 }}
    onClick={(e) => e.stopPropagation()}
  >
    {options.map((option, index) => (
      <div key={index} onClick={option.action} style={{ padding: '5px', cursor: 'pointer' }}>
        {option.label}
      </div>
    ))}
  </div>
);

const TreeItem: React.FC<{ 
  node: TreeNode; 
  level: number; 
  refreshData: () => Promise<void>;
}> = ({ node, level, refreshData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { contextMenu, setContextMenu } = useContextMenu();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type !== 'wave') {
      setIsOpen(!isOpen);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const options = [
      { label: '重命名',
        action: () => {
          setIsRenaming(true);
          setContextMenu(null);
        } 
      },
      { label: '删除', action: () => handleDelete(node) }
    ];
    
    if (node.type === 'origin') {
      options.push({ 
        label: '新建Cluster', 
        action: () => handleAdd(node) 
      });
    } else if (node.type === 'cluster') {
      options.push({ 
        label: '新建Wave', 
        action: () => handleAdd(node) 
      });
    }

    setContextMenu({ x: e.clientX, y: e.clientY, options });
  };

  const handleAdd = async (parentNode: FrontendOrigin | FrontendCluster) => {
    try {
      if (parentNode.type === 'origin') {
        await invoke('create_cluster', { originId: Number(parentNode.id) });
      } else if (parentNode.type === 'cluster') {
        await invoke('create_wave', { clusterId: Number(parentNode.id) });
      }
      await refreshData();
    } catch (error) {
      console.error('Failed to add item:', error);
    }
    setContextMenu(null);
  };

  const handleDelete = async (nodeToDelete: TreeNode) => {
    try {
      if (nodeToDelete.type === 'origin') {
        await invoke('delete_origin', { originId: Number(nodeToDelete.id) });
      } else if (nodeToDelete.type === 'cluster') {
        await invoke('delete_cluster', { clusterId: Number(nodeToDelete.id) });
      } else if (nodeToDelete.type === 'wave') {
        await invoke('delete_wave', { waveId: Number(nodeToDelete.id) });
      }
      await refreshData();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
    setContextMenu(null);
  };

  const handleRename = async () => {
    try {
      await invoke(`rename_${node.type}`, { id: Number(node.id), changeName: newName });
      await refreshData();
      setIsRenaming(false);
    } catch (error) {
      console.error('Failed to rename item:', error);
    }
  };

  return (
    <div>
      <div 
        className="tree-item" 
        style={{ paddingLeft: `${level * 20}px` }}
        onClick={toggleOpen}
        onContextMenu={handleContextMenu}
      >
        {node.type !== 'wave' && (node as FrontendOrigin | FrontendCluster).children.length > 0 ? (
          isOpen ? <FaChevronDown /> : <FaChevronRight />
        ) : <span style={{ width: '16px', display: 'inline-block' }}></span>}
        {node.type === 'wave' ? <FaFile /> : (isOpen ? <FaFolderOpen /> : <FaFolder />)}
        {isRenaming ? (
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleRename()
              };
            }}
            autoFocus
          />
        ) : (
          <span className="node-name">{node.name}</span>
        )}
      </div>
      {isOpen && node.type !== 'wave' && 'children' in node && (
        <div className="tree-children">
          {node.children.map(childNode => (
            <TreeItem 
              key={childNode.id} 
              node={childNode} 
              level={level + 1} 
              refreshData={refreshData}
            />
          ))}
        </div>
      )}
      {contextMenu && <ContextMenu {...contextMenu} />}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ data, refreshData }) => {
  const [isMenuVisible, setMenuVisible] = useState(false);
  const { contextMenu, setContextMenu } = useContextMenu();

  const handleMouseEnter = () => setMenuVisible(true);
  const handleMouseLeave = () => setMenuVisible(false);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      options: [
        { label: '新建Origin', action: () => handleAddOrigin() }
      ]
    });
  }, [setContextMenu]);

  const handleAddOrigin = async () => {
    try {
      await invoke('create_origin');
      await refreshData();
    } catch (error) {
      console.error('Failed to add origin:', error);
    }
    setContextMenu(null);
  };

  return (
    <div className="sidebar" onContextMenu={handleContextMenu}>
      <div className="sidebar-order">
        <button
          className="sidebar-order-selection"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          排列顺序
          {isMenuVisible && (
            <div className="dropdown-menu">
              <button className="sidebar-order-button">按创建时间</button>
              <button className="sidebar-order-button">按字典序</button>
            </div>
          )}
        </button>
      </div>

      {data.map(node => (
        <TreeItem 
          key={node.id} 
          node={node} 
          level={0} 
          refreshData={refreshData}
        />
      ))}
      {contextMenu && <ContextMenu {...contextMenu} />}
    </div>
  );
};

export default Sidebar;