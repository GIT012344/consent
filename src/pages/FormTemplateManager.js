import React, { useState, useEffect } from 'react';
import { Save, Upload, FileText, Plus, Trash2, Edit2, X, Check, AlertCircle, ChevronUp, ChevronDown, Eye, Download, Copy, FileUp } from 'lucide-react';
import axios from 'axios';
import { formTemplateAPI, consentAPI } from '../services/api';

const FormTemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    userType: 'customer',
    language: 'th',
    templateName: '',
    description: '',
    fields: [],
    consentText: '',
    version: '1.0',
    isActive: true
  });
  const [consentContent, setConsentContent] = useState('');
  const [versions, setVersions] = useState([]);
  const [activeUserType, setActiveUserType] = useState('customer');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  const userTypes = [
    { value: 'customer', label: 'ลูกค้าทั่วไป', icon: '👤', color: 'blue' },
    { value: 'employee', label: 'พนักงาน', icon: '💼', color: 'green' },
    { value: 'partner', label: 'พาร์ทเนอร์', icon: '🤝', color: 'purple' }
  ];

  const defaultFields = {
    customer: [
      { name: 'title', label: 'คำนำหน้า', type: 'select', required: true, options: ['นาย', 'นาง', 'นางสาว'] },
      { name: 'firstName', label: 'ชื่อ', type: 'text', required: true },
      { name: 'lastName', label: 'นามสกุล', type: 'text', required: true },
      { name: 'idCard', label: 'เลขบัตรประชาชน', type: 'text', required: true, pattern: '[0-9]{13}' },
      { name: 'email', label: 'อีเมล', type: 'email', required: true },
      { name: 'phone', label: 'เบอร์โทร', type: 'tel', required: true }
    ],
    employee: [
      { name: 'employeeId', label: 'รหัสพนักงาน', type: 'text', required: true },
      { name: 'title', label: 'คำนำหน้า', type: 'select', required: true, options: ['นาย', 'นาง', 'นางสาว'] },
      { name: 'firstName', label: 'ชื่อ', type: 'text', required: true },
      { name: 'lastName', label: 'นามสกุล', type: 'text', required: true },
      { name: 'department', label: 'แผนก', type: 'select', required: true, options: ['IT', 'HR', 'Sales', 'Marketing', 'Finance'] },
      { name: 'position', label: 'ตำแหน่ง', type: 'text', required: true },
      { name: 'email', label: 'อีเมลบริษัท', type: 'email', required: true },
      { name: 'phone', label: 'เบอร์ภายใน', type: 'tel', required: true }
    ],
    partner: [
      { name: 'companyName', label: 'ชื่อบริษัท', type: 'text', required: true },
      { name: 'taxId', label: 'เลขประจำตัวผู้เสียภาษี', type: 'text', required: true },
      { name: 'title', label: 'คำนำหน้า', type: 'select', required: true, options: ['นาย', 'นาง', 'นางสาว'] },
      { name: 'firstName', label: 'ชื่อผู้ติดต่อ', type: 'text', required: true },
      { name: 'lastName', label: 'นามสกุลผู้ติดต่อ', type: 'text', required: true },
      { name: 'position', label: 'ตำแหน่ง', type: 'text', required: true },
      { name: 'email', label: 'อีเมลผู้ติดต่อ', type: 'email', required: true },
      { name: 'phone', label: 'เบอร์โทร', type: 'tel', required: true },
      { name: 'address', label: 'ที่อยู่บริษัท', type: 'textarea', required: true }
    ]
  };

  const [formTemplate, setFormTemplate] = useState({
    userType: 'customer',
    fields: defaultFields.customer,
    consentText: '',
    language: 'th'
  });

  useEffect(() => {
    fetchTemplates();
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      const response = await consentAPI.getConsentVersions();
      setVersions(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching versions:', error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/form-templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Load default templates
      const defaultTemplates = Object.keys(defaultFields).map(type => ({
        id: type,
        userType: type,
        fields: defaultFields[type],
        consentText: getDefaultConsentText(type),
        isActive: true
      }));
      setTemplates(defaultTemplates);
    }
  };

  const getDefaultConsentText = (userType) => {
    const texts = {
      customer: 'ข้าพเจ้ายินยอมให้บริษัทเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้าตามวัตถุประสงค์ที่ระบุในนโยบายความเป็นส่วนตัว',
      employee: 'ข้าพเจ้ายินยอมให้บริษัทเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของข้าพเจ้าเพื่อการบริหารทรัพยากรบุคคลและการปฏิบัติตามกฎหมายแรงงาน',
      partner: 'ข้าพเจ้าในฐานะตัวแทนบริษัทยินยอมให้เก็บรวบรวม ใช้ และเปิดเผยข้อมูลเพื่อการดำเนินธุรกิจร่วมกันตามข้อตกลงความร่วมมือ'
    };
    return texts[userType] || texts.customer;
  };

  const handleSaveTemplate = async () => {
    setLoading(true);
    try {
      const templateData = {
        ...selectedTemplate,
        consentContent: consentContent || selectedTemplate?.consentContent,
        versionId: selectedTemplate?.versionId
      };
      
      if (selectedTemplate?.id) {
        await formTemplateAPI.updateTemplate(selectedTemplate.id, templateData);
      } else {
        await formTemplateAPI.createTemplate(templateData);
      }
      fetchTemplates();
      setShowModal(false);
      setSelectedTemplate(null);
      setConsentContent('');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setConsentContent(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleCreateVersion = async () => {
    if (!uploadedFile || !consentContent) {
      alert('กรุณาเลือกไฟล์');
      return;
    }
    
    setLoading(true);
    try {
      const newVersion = {
        version: `${versions.length + 1}.0`,
        userType: selectedTemplate?.userType || 'customer',
        language: selectedTemplate?.language || 'th',
        description: selectedTemplate?.description || 'New consent version',
        content: consentContent,
        fileName: uploadedFile.name,
        fileSize: `${(uploadedFile.size / 1024).toFixed(2)} KB`,
        isActive: true
      };
      
      await consentAPI.createConsentVersion(newVersion);
      fetchVersions();
      setShowUploadModal(false);
      setUploadedFile(null);
      setConsentContent('');
      alert('อัพโหลดเวอร์ชันใหม่สำเร็จ');
    } catch (error) {
      console.error('Error creating version:', error);
      alert('เกิดข้อผิดพลาดในการอัพโหลด');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (window.confirm('ต้องการลบ template นี้หรือไม่?')) {
      try {
        await axios.delete(`http://localhost:3000/api/form-templates/${id}`);
        await fetchTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleAddField = () => {
    const newField = {
      name: '',
      label: '',
      type: 'text',
      required: false
    };
    setFormTemplate({
      ...formTemplate,
      fields: [...formTemplate.fields, newField]
    });
  };

  const handleUpdateField = (index, field) => {
    const updatedFields = [...formTemplate.fields];
    updatedFields[index] = field;
    setFormTemplate({ ...formTemplate, fields: updatedFields });
  };

  const handleRemoveField = (index) => {
    const updatedFields = formTemplate.fields.filter((_, i) => i !== index);
    setFormTemplate({ ...formTemplate, fields: updatedFields });
  };

  const resetForm = () => {
    setFormTemplate({
      userType: 'customer',
      fields: defaultFields.customer,
      consentText: '',
      language: 'th'
    });
    setSelectedTemplate(null);
  };

  const FieldEditor = ({ field, index, onChange, onRemove }) => {
    const [expanded, setExpanded] = useState(false);
    
    return (
      <div className="border rounded-lg p-3 mb-2 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <input
              type="text"
              placeholder="Field name (e.g. firstName)"
              value={field.name}
              onChange={(e) => onChange(index, { ...field, name: e.target.value })}
              className="px-2 py-1 border rounded text-sm font-mono"
            />
            <input
              type="text"
              placeholder="Label (e.g. ชื่อ)"
              value={field.label}
              onChange={(e) => onChange(index, { ...field, label: e.target.value })}
              className="px-2 py-1 border rounded text-sm flex-1"
            />
            <select
              value={field.type}
              onChange={(e) => onChange(index, { ...field, type: e.target.value })}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value="text">Text</option>
              <option value="email">Email</option>
              <option value="tel">Tel</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="select">Select</option>
              <option value="textarea">Textarea</option>
              <option value="checkbox">Checkbox</option>
            </select>
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => onChange(index, { ...field, required: e.target.checked })}
              />
              <span className="text-sm">Required</span>
            </label>
          </div>
          <button
            onClick={() => onRemove(index)}
            className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
        
        {expanded && (
          <div className="mt-3 pt-3 border-t space-y-2">
            {field.type === 'select' && (
              <div>
                <label className="text-xs text-gray-600">Options (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. นาย,นาง,นางสาว"
                  value={field.options?.join(',') || ''}
                  onChange={(e) => onChange(index, { ...field, options: e.target.value.split(',').map(o => o.trim()) })}
                  className="w-full px-2 py-1 border rounded text-sm"
                />
              </div>
            )}
            {(field.type === 'text' || field.type === 'tel') && (
              <div>
                <label className="text-xs text-gray-600">Pattern (regex)</label>
                <input
                  type="text"
                  placeholder="e.g. [0-9]{13}"
                  value={field.pattern || ''}
                  onChange={(e) => onChange(index, { ...field, pattern: e.target.value })}
                  className="w-full px-2 py-1 border rounded text-sm font-mono"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-gray-600">Placeholder</label>
              <input
                type="text"
                placeholder="Placeholder text"
                value={field.placeholder || ''}
                onChange={(e) => onChange(index, { ...field, placeholder: e.target.value })}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">จัดการ Form Templates</h1>
                <p className="text-sm text-gray-500">กำหนดฟอร์มที่แตกต่างกันสำหรับแต่ละประเภทผู้ใช้</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowEditor(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>สร้าง Template ใหม่</span>
            </button>
          </div>
        </div>

        {/* User Type Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex space-x-2">
            {userTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setActiveUserType(type.value)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
                  activeUserType === type.value
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {templates
            .filter(t => t.userType === activeUserType)
            .map(template => (
              <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Template: {getUserTypeLabel(template.userType)}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {template.fields?.length || 0} fields
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs ${
                      template.isActive 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  {/* Field Preview */}
                  <div className="space-y-2 mb-4">
                    {template.fields?.slice(0, 3).map((field, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm">
                        <span className="font-mono text-gray-500">{field.name}:</span>
                        <span className="text-gray-700">{field.label}</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{field.type}</span>
                        {field.required && (
                          <span className="text-xs text-red-500">*</span>
                        )}
                      </div>
                    ))}
                    {template.fields?.length > 3 && (
                      <p className="text-sm text-gray-400">
                        +{template.fields.length - 3} more fields
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTemplate(template);
                          setFormTemplate(template);
                          setShowEditor(true);
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setFormTemplate({ ...template });
                          setShowEditor(true);
                        }}
                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Empty State */}
        {templates.filter(t => t.userType === activeUserType).length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              ไม่มี Template สำหรับ {getUserTypeLabel(activeUserType)}
            </h3>
            <button
              onClick={() => {
                setFormTemplate({
                  userType: activeUserType,
                  fields: defaultFields[activeUserType],
                  consentText: getDefaultConsentText(activeUserType),
                  language: 'th'
                });
                setShowEditor(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg"
            >
              สร้าง Template แรก
            </button>
          </div>
        )}
      </div>

      {/* Template Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b p-6 z-10">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedTemplate ? 'แก้ไข Template' : 'สร้าง Template ใหม่'}
              </h3>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* User Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ประเภทผู้ใช้
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {userTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setFormTemplate({ 
                        ...formTemplate, 
                        userType: type.value,
                        fields: defaultFields[type.value]
                      })}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        formTemplate.userType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.icon}</div>
                      <div className="text-sm font-medium">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fields Editor */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Form Fields
                  </label>
                  <button
                    onClick={handleAddField}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
                  >
                    + เพิ่ม Field
                  </button>
                </div>
                
                <div className="space-y-2">
                  {formTemplate.fields?.map((field, index) => (
                    <FieldEditor
                      key={index}
                      field={field}
                      index={index}
                      onChange={handleUpdateField}
                      onRemove={handleRemoveField}
                    />
                  ))}
                </div>
              </div>

              {/* Consent Text */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ข้อความยินยอม
                </label>
                <textarea
                  value={formTemplate.consentText}
                  onChange={(e) => setFormTemplate({ ...formTemplate, consentText: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  placeholder="ข้อความที่จะแสดงในส่วนของการให้ความยินยอม..."
                />
              </div>
            </div>
            
            {/* Modal Actions */}
            <div className="sticky bottom-0 bg-white border-t p-6">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowEditor(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>บันทึก Template</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function getUserTypeLabel(type) {
    const found = userTypes.find(t => t.value === type);
    return found ? found.label : type;
  }
};

export default FormTemplateManager;
