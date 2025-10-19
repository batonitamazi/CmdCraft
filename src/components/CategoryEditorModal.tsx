import React, { useState, useEffect } from 'react';

// Types
interface CommandArg {
  name: string;
  desc: string;
  hasInput: boolean;
  placeholder?: string;
  openFileDialog?: boolean;
}

interface Command {
  desc: string;
  args: CommandArg[];
}

interface Category {
  icon: string;
  commands: { [key: string]: Command };
  isCustom?: boolean;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryName: string, category: Category) => void;
  editingCategory?: { name: string; data: Category };
}

// Category Editor Modal
const CategoryEditorModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingCategory
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [icon, setIcon] = useState('📦');
  const [commands, setCommands] = useState<{ [key: string]: Command }>({});
  const [currentCommand, setCurrentCommand] = useState('');
  const [currentCommandDesc, setCurrentCommandDesc] = useState('');
  const [currentArgs, setCurrentArgs] = useState<CommandArg[]>([]);
  const [editingCommandName, setEditingCommandName] = useState<string | null>(null);

  useEffect(() => {
    if (editingCategory) {
      setCategoryName(editingCategory.name);
      setIcon(editingCategory.data.icon);
      setCommands(editingCategory.data.commands);
    } else {
      resetForm();
    }
  }, [editingCategory, isOpen]);

  const resetForm = () => {
    setCategoryName('');
    setIcon('📦');
    setCommands({});
    setCurrentCommand('');
    setCurrentCommandDesc('');
    setCurrentArgs([]);
    setEditingCommandName(null);
  };

  const addArgument = () => {
    setCurrentArgs([...currentArgs, {
      name: '',
      desc: '',
      hasInput: false,
      placeholder: ''
    }]);
  };

  const updateArgument = (index: number, field: keyof CommandArg, value: any) => {
    const updated = [...currentArgs];
    updated[index] = { ...updated[index], [field]: value };
    setCurrentArgs(updated);
  };

  const removeArgument = (index: number) => {
    setCurrentArgs(currentArgs.filter((_, i) => i !== index));
  };

  const saveCommand = () => {
    if (!currentCommand.trim() || !currentCommandDesc.trim()) {
      alert('Command name and description are required');
      return;
    }

    const newCommands = { ...commands };
    
    if (editingCommandName && editingCommandName !== currentCommand) {
      delete newCommands[editingCommandName];
    }

    newCommands[currentCommand] = {
      desc: currentCommandDesc,
      args: currentArgs.filter(arg => arg.name.trim() && arg.desc.trim())
    };

    setCommands(newCommands);
    setCurrentCommand('');
    setCurrentCommandDesc('');
    setCurrentArgs([]);
    setEditingCommandName(null);
  };

  const editCommand = (cmdName: string) => {
    const cmd = commands[cmdName];
    setCurrentCommand(cmdName);
    setCurrentCommandDesc(cmd.desc);
    setCurrentArgs([...cmd.args]);
    setEditingCommandName(cmdName);
  };

  const deleteCommand = (cmdName: string) => {
    if (confirm(`Delete command "${cmdName}"?`)) {
      const newCommands = { ...commands };
      delete newCommands[cmdName];
      setCommands(newCommands);
    }
  };

  const handleSave = () => {
    if (!categoryName.trim()) {
      alert('Category name is required');
      return;
    }

    if (Object.keys(commands).length === 0) {
      alert('Add at least one command');
      return;
    }

    onSave(categoryName, {
      icon,
      commands,
      isCustom: true
    });

    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #2a2a3e 0%, #1e1e2e 100%)',
        borderRadius: '16px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        border: '2px solid rgba(98, 114, 164, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '2px solid rgba(98, 114, 164, 0.3)',
          position: 'sticky',
          top: 0,
          background: 'linear-gradient(135deg, #2a2a3e 0%, #1e1e2e 100%)',
          zIndex: 10
        }}>
          <h2 style={{
            margin: 0,
            color: '#66d9ef',
            fontSize: '24px',
            fontWeight: 700
          }}>
            {editingCategory ? '✏️ Edit Category' : '➕ Create Custom Category'}
          </h2>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Category Details */}
          <div style={{
            background: 'rgba(68, 71, 90, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#a3be8c', marginBottom: '16px', fontSize: '18px' }}>
              Category Details
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#8890a0', marginBottom: '8px', fontSize: '14px' }}>
                  Icon
                </label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="📦"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(68, 71, 90, 0.5)',
                    border: '2px solid rgba(98, 114, 164, 0.3)',
                    borderRadius: '8px',
                    color: '#e0e0e0',
                    fontSize: '24px',
                    textAlign: 'center'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#8890a0', marginBottom: '8px', fontSize: '14px' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., My Custom Commands"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(68, 71, 90, 0.5)',
                    border: '2px solid rgba(98, 114, 164, 0.3)',
                    borderRadius: '8px',
                    color: '#e0e0e0',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Commands List */}
          {Object.keys(commands).length > 0 && (
            <div style={{
              background: 'rgba(68, 71, 90, 0.3)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: '#a3be8c', marginBottom: '16px', fontSize: '18px' }}>
                Commands ({Object.keys(commands).length})
              </h3>
              
              {Object.entries(commands).map(([cmdName, cmd]) => (
                <div key={cmdName} style={{
                  background: 'rgba(58, 61, 80, 0.4)',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  borderLeft: '3px solid #a3be8c'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#66d9ef', fontWeight: 600, marginBottom: '4px' }}>
                        {cmdName}
                      </div>
                      <div style={{ color: '#8890a0', fontSize: '13px', marginBottom: '8px' }}>
                        {cmd.desc}
                      </div>
                      {cmd.args.length > 0 && (
                        <div style={{ fontSize: '12px', color: '#6272a4' }}>
                          📋 {cmd.args.length} argument{cmd.args.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => editCommand(cmdName)}
                        style={{
                          background: 'rgba(102, 217, 239, 0.2)',
                          border: '1px solid rgba(102, 217, 239, 0.3)',
                          color: '#66d9ef',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteCommand(cmdName)}
                        style={{
                          background: 'rgba(191, 97, 106, 0.2)',
                          border: '1px solid rgba(191, 97, 106, 0.3)',
                          color: '#bf616a',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Command Editor */}
          <div style={{
            background: 'rgba(68, 71, 90, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ color: '#ebcb8b', marginBottom: '16px', fontSize: '18px' }}>
              {editingCommandName ? '✏️ Edit Command' : '➕ Add Command'}
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#8890a0', marginBottom: '8px', fontSize: '14px' }}>
                Command Name *
              </label>
              <input
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                placeholder="e.g., mycommand"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(68, 71, 90, 0.5)',
                  border: '2px solid rgba(98, 114, 164, 0.3)',
                  borderRadius: '8px',
                  color: '#e0e0e0',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#8890a0', marginBottom: '8px', fontSize: '14px' }}>
                Description *
              </label>
              <input
                type="text"
                value={currentCommandDesc}
                onChange={(e) => setCurrentCommandDesc(e.target.value)}
                placeholder="What does this command do?"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(68, 71, 90, 0.5)',
                  border: '2px solid rgba(98, 114, 164, 0.3)',
                  borderRadius: '8px',
                  color: '#e0e0e0',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Arguments */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ color: '#8890a0', fontSize: '14px' }}>
                  Arguments
                </label>
                <button
                  onClick={addArgument}
                  style={{
                    background: 'rgba(163, 190, 140, 0.2)',
                    border: '1px solid rgba(163, 190, 140, 0.3)',
                    color: '#a3be8c',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  + Add Argument
                </button>
              </div>

              {currentArgs.map((arg, idx) => (
                <div key={idx} style={{
                  background: 'rgba(58, 61, 80, 0.4)',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={arg.name}
                      onChange={(e) => updateArgument(idx, 'name', e.target.value)}
                      placeholder="Arg name"
                      style={{
                        padding: '8px',
                        background: 'rgba(68, 71, 90, 0.5)',
                        border: '1px solid rgba(98, 114, 164, 0.3)',
                        borderRadius: '6px',
                        color: '#e0e0e0',
                        fontSize: '13px'
                      }}
                    />
                    <input
                      type="text"
                      value={arg.desc}
                      onChange={(e) => updateArgument(idx, 'desc', e.target.value)}
                      placeholder="Description"
                      style={{
                        padding: '8px',
                        background: 'rgba(68, 71, 90, 0.5)',
                        border: '1px solid rgba(98, 114, 164, 0.3)',
                        borderRadius: '6px',
                        color: '#e0e0e0',
                        fontSize: '13px'
                      }}
                    />
                    <button
                      onClick={() => removeArgument(idx)}
                      style={{
                        background: 'rgba(191, 97, 106, 0.2)',
                        border: '1px solid rgba(191, 97, 106, 0.3)',
                        color: '#bf616a',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑️
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8890a0', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={arg.hasInput}
                        onChange={(e) => updateArgument(idx, 'hasInput', e.target.checked)}
                        style={{ cursor: 'pointer' }}
                      />
                      Requires Input
                    </label>
                    
                    {arg.hasInput && (
                      <>
                        <input
                          type="text"
                          value={arg.placeholder || ''}
                          onChange={(e) => updateArgument(idx, 'placeholder', e.target.value)}
                          placeholder="Input placeholder"
                          style={{
                            flex: 1,
                            padding: '6px',
                            background: 'rgba(68, 71, 90, 0.5)',
                            border: '1px solid rgba(98, 114, 164, 0.3)',
                            borderRadius: '6px',
                            color: '#e0e0e0',
                            fontSize: '12px'
                          }}
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8890a0', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={arg.openFileDialog || false}
                            onChange={(e) => updateArgument(idx, 'openFileDialog', e.target.checked)}
                            style={{ cursor: 'pointer' }}
                          />
                          File Dialog
                        </label>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={saveCommand}
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #a3be8c 0%, #8fa876 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#1e1e2e',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(163, 190, 140, 0.3)'
              }}
            >
              {editingCommandName ? '💾 Update Command' : '➕ Add Command to Category'}
            </button>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                background: 'rgba(68, 71, 90, 0.5)',
                border: '2px solid rgba(98, 114, 164, 0.3)',
                borderRadius: '8px',
                color: '#8890a0',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '14px',
                background: 'linear-gradient(135deg, #66d9ef 0%, #4fa8c5 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#1e1e2e',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(102, 217, 239, 0.3)'
              }}
            >
              💾 Save Category
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo App
const App = () => {
  const [categories, setCategories] = useState<{ [key: string]: Category }>({
    'File System': {
      icon: '📁',
      commands: {
        'ls': {
          desc: 'List directory contents',
          args: [
            { name: '-l', desc: 'Long format', hasInput: false },
            { name: 'path', desc: 'Directory path', hasInput: true, placeholder: '/path/to/dir' }
          ]
        }
      }
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ name: string; data: Category } | undefined>();

  const handleSaveCategory = (categoryName: string, category: Category) => {
    setCategories(prev => ({
      ...prev,
      [categoryName]: category
    }));
    setEditingCategory(undefined);
  };

  const handleDeleteCategory = (categoryName: string) => {
    if (confirm(`Delete category "${categoryName}"?`)) {
      setCategories(prev => {
        const updated = { ...prev };
        delete updated[categoryName];
        return updated;
      });
    }
  };

  const handleEditCategory = (categoryName: string) => {
    setEditingCategory({
      name: categoryName,
      data: categories[categoryName]
    });
    setIsModalOpen(true);
  };

  return <CategoryEditorModal isOpen={true} onClose={() => {}} onSave={(name, cat) => console.log(name, cat)} />;
};

export { CategoryEditorModal };
export default App;