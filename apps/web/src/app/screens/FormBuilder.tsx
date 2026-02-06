import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Logo } from '../components/Logo';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  GripVertical,
  Type,
  Mail,
  Phone,
  Calendar,
  Check,
  List,
  FileText,
  Save,
  Eye,
  Settings as SettingsIcon
} from 'lucide-react';

interface FormBuilderProps {
  projectId: string;
  onBack: () => void;
}

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export function FormBuilder({ projectId, onBack }: FormBuilderProps) {
  const [formName, setFormName] = useState('Contact Form');
  const [formFields, setFormFields] = useState<FormField[]>([
    {
      id: '1',
      type: 'text',
      label: 'Name',
      placeholder: 'Your name',
      required: true,
    },
    {
      id: '2',
      type: 'email',
      label: 'Email',
      placeholder: 'you@example.com',
      required: true,
    },
    {
      id: '3',
      type: 'textarea',
      label: 'Message',
      placeholder: 'Your message',
      required: false,
    },
  ]);

  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const fieldTypes = [
    { type: 'text', label: 'Text Input', icon: Type },
    { type: 'email', label: 'Email', icon: Mail },
    { type: 'phone', label: 'Phone', icon: Phone },
    { type: 'textarea', label: 'Text Area', icon: FileText },
    { type: 'select', label: 'Dropdown', icon: List },
    { type: 'checkbox', label: 'Checkbox', icon: Check },
    { type: 'date', label: 'Date Picker', icon: Calendar },
  ];

  const addField = (type: string) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type: type as FormField['type'],
      label: `New ${type} field`,
      placeholder: '',
      required: false,
      options: type === 'select' ? ['Option 1', 'Option 2'] : undefined,
    };
    setFormFields([...formFields, newField]);
    setShowFieldSelector(false);
    setEditingField(newField);
  };

  const removeField = (id: string) => {
    setFormFields(formFields.filter((field) => field.id !== id));
    if (editingField?.id === id) {
      setEditingField(null);
    }
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFormFields(
      formFields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
    if (editingField?.id === id) {
      setEditingField({ ...editingField, ...updates });
    }
  };

  const handleSave = () => {
    toast.success('Form saved successfully!');
  };

  const handlePublish = () => {
    toast.success('Form published! You can now add it to your page.');
  };

  const getFieldIcon = (type: string) => {
    const fieldType = fieldTypes.find((ft) => ft.type === type);
    return fieldType?.icon || Type;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </button>
          <Logo size="sm" />
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button onClick={handlePublish}>
              <Save className="h-4 w-4" />
              Publish Form
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <Input
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="text-2xl font-bold border-none px-0 focus:ring-0"
            placeholder="Form Name"
          />
          <p className="text-muted-foreground mt-2">
            Create custom forms to collect information from your visitors
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Builder - Left */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-lg">Form Fields</h2>
                <Button size="sm" onClick={() => setShowFieldSelector(true)}>
                  <Plus className="h-4 w-4" />
                  Add Field
                </Button>
              </div>

              <div className="p-6 space-y-3">
                {formFields.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">
                      No fields yet. Start building your form.
                    </p>
                    <Button onClick={() => setShowFieldSelector(true)}>
                      <Plus className="h-4 w-4" />
                      Add First Field
                    </Button>
                  </div>
                ) : (
                  formFields.map((field) => {
                    const Icon = getFieldIcon(field.type);
                    return (
                      <div
                        key={field.id}
                        className={`p-4 border-2 rounded-lg transition-all cursor-pointer ${
                          editingField?.id === field.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => setEditingField(field)}
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{field.label}</p>
                              {field.required && (
                                <span className="text-xs text-destructive">*</span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground capitalize">
                              {field.type}
                              {field.placeholder && ` • ${field.placeholder}`}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeField(field.id);
                            }}
                            className="p-2 hover:bg-destructive/10 rounded-md transition-colors"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Submit Button Settings */}
            <Card>
              <div className="p-6 border-b border-border">
                <h3 className="font-bold">Submit Button</h3>
              </div>
              <div className="p-6 space-y-4">
                <Input label="Button Text" defaultValue="Submit" />
                <Input label="Success Message" defaultValue="Thank you! We'll be in touch soon." />
              </div>
            </Card>
          </div>

          {/* Field Settings - Right */}
          <div className="space-y-4">
            <Card>
              <div className="p-6 border-b border-border">
                <h3 className="font-bold flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Field Settings
                </h3>
              </div>
              {editingField ? (
                <div className="p-6 space-y-4">
                  <Input
                    label="Field Label"
                    value={editingField.label}
                    onChange={(e) =>
                      updateField(editingField.id, { label: e.target.value })
                    }
                  />
                  <Input
                    label="Placeholder"
                    value={editingField.placeholder || ''}
                    onChange={(e) =>
                      updateField(editingField.id, { placeholder: e.target.value })
                    }
                  />

                  {editingField.type === 'select' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Options</label>
                      {editingField.options?.map((option, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...(editingField.options || [])];
                              newOptions[index] = e.target.value;
                              updateField(editingField.id, { options: newOptions });
                            }}
                            className="flex-1 px-3 py-2 rounded-md border border-input"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newOptions = editingField.options?.filter(
                                (_, i) => i !== index
                              );
                              updateField(editingField.id, { options: newOptions });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        onClick={() => {
                          updateField(editingField.id, {
                            options: [
                              ...(editingField.options || []),
                              `Option ${(editingField.options?.length || 0) + 1}`,
                            ],
                          });
                        }}
                      >
                        <Plus className="h-4 w-4" />
                        Add Option
                      </Button>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">Required Field</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingField.required}
                        onChange={(e) =>
                          updateField(editingField.id, { required: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <Button
                    variant="destructive"
                    fullWidth
                    onClick={() => {
                      removeField(editingField.id);
                      setEditingField(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Field
                  </Button>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <SettingsIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                  <p className="text-sm text-muted-foreground">
                    Select a field to edit its settings
                  </p>
                </div>
              )}
            </Card>

            {/* Form Settings */}
            <Card>
              <div className="p-6 border-b border-border">
                <h3 className="font-bold">Form Settings</h3>
              </div>
              <div className="p-6 space-y-4">
                <Input label="Send Submissions To" type="email" defaultValue="you@example.com" />
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Spam Protection</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save Form
          </Button>
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Field Selector Modal */}
      {showFieldSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-lg">Add Field</h3>
              <button onClick={() => setShowFieldSelector(false)}>
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {fieldTypes.map((fieldType) => {
                const Icon = fieldType.icon;
                return (
                  <button
                    key={fieldType.type}
                    onClick={() => addField(fieldType.type)}
                    className="p-6 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <Icon className="h-8 w-8 mb-3 text-primary" />
                    <p className="font-medium">{fieldType.label}</p>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-lg">Form Preview</h3>
              <button onClick={() => setShowPreview(false)}>
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6">{formName}</h2>
              <form className="space-y-4">
                {formFields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium mb-2">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        placeholder={field.placeholder}
                        className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input"
                      />
                    ) : field.type === 'select' ? (
                      <select className="w-full px-3 py-2 rounded-md border border-input">
                        <option>Select an option...</option>
                        {field.options?.map((option, idx) => (
                          <option key={idx}>{option}</option>
                        ))}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{field.placeholder || field.label}</span>
                      </label>
                    ) : (
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 rounded-md border border-input"
                      />
                    )}
                  </div>
                ))}
                <Button type="button" fullWidth size="lg">
                  Submit
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
