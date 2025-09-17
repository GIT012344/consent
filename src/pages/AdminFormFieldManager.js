import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminFormFieldManager = () => {
  const [formFields, setFormFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    field_name: '',
    field_label_th: '',
    field_label_en: '',
    field_type: 'text',
    is_required: true,
    is_active: true,
    display_order: 0,
    options: []
  });

  const fieldTypes = [
    { value: 'text', label: 'ข้อความ (Text)' },
    { value: 'email', label: 'อีเมล (Email)' },
    { value: 'tel', label: 'เบอร์โทร (Phone)' },
    { value: 'number', label: 'ตัวเลข (Number)' },
    { value: 'date', label: 'วันที่ (Date)' },
    { value: 'select', label: 'เลือกจากรายการ (Dropdown)' },
    { value: 'radio', label: 'เลือกหนึ่งตัวเลือก (Radio)' },
    { value: 'checkbox', label: 'เลือกได้หลายตัวเลือก (Checkbox)' },
    { value: 'textarea', label: 'ข้อความยาว (Textarea)' }
  ];

  useEffect(() => {
    fetchFormFields();
  }, []);

  const fetchFormFields = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/form-fields');
      if (response.data.success) {
        setFormFields(response.data.data || []);
      }
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลได้');
      console.error('Error fetching form fields:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('ต้องการลบฟิลด์นี้หรือไม่?')) {
      try {
        await axios.delete(`http://localhost:3000/api/form-fields/${id}`);
        fetchFormFields();
      } catch (err) {
        setError('ไม่สามารถลบข้อมูลได้');
        console.error('Error deleting field:', err);
      }
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setFormData({
      field_name: field.field_name,
      field_label_th: field.field_label_th,
      field_label_en: field.field_label_en,
      field_type: field.field_type,
      is_required: field.is_required,
      is_active: field.is_active,
      display_order: field.display_order,
      options: field.options || []
    });
    setShowAddModal(true);
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await axios.put(`http://localhost:3000/api/form-fields/${id}`, {
        is_active: !currentStatus
      });
      fetchFormFields();
    } catch (err) {
      setError('ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingField(null);
    setFormData({
      field_name: '',
      field_label_th: '',
      field_label_en: '',
      field_type: 'text',
      is_required: true,
      is_active: true,
      display_order: 0,
      options: []
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingField) {
        await axios.put(`http://localhost:3000/api/form-fields/${editingField.id}`, formData);
      } else {
        await axios.post('http://localhost:3000/api/form-fields', formData);
      }
      handleCloseModal();
      fetchFormFields();
    } catch (err) {
      setError('ไม่สามารถบันทึกข้อมูลได้');
      console.error('Error submitting form:', err);
    }
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { label_th: '', label_en: '', value: '' }]
    });
  };

  const handleRemoveOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({ ...formData, options: newOptions });
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;
    setFormData({ ...formData, options: newOptions });
  };

  if (loading) return <div className="text-center p-8">กำลังโหลด...</div>;

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">จัดการฟิลด์แบบฟอร์ม</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            เพิ่มฟิลด์ใหม่
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ลำดับ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อฟิลด์
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ป้ายกำกับ (ไทย)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ประเภท
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จำเป็น
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {formFields.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    ไม่มีข้อมูลฟิลด์
                  </td>
                </tr>
              ) : (
                formFields.sort((a, b) => a.display_order - b.display_order).map((field) => (
                  <tr key={field.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {field.display_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {field.field_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {field.field_label_th}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fieldTypes.find(t => t.value === field.field_type)?.label || field.field_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        field.is_required
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {field.is_required ? 'จำเป็น' : 'ไม่จำเป็น'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleActive(field.id, field.is_active)}
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors ${
                          field.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {field.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                      <button
                        onClick={() => handleEdit(field)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(field.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingField ? 'แก้ไขฟิลด์' : 'เพิ่มฟิลด์ใหม่'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    ชื่อฟิลด์ (Field Name) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.field_name}
                    onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="เช่น first_name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    ลำดับการแสดง <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    ป้ายกำกับ (ภาษาไทย) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.field_label_th}
                    onChange={(e) => setFormData({ ...formData, field_label_th: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="เช่น ชื่อ"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    ป้ายกำกับ (ภาษาอังกฤษ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.field_label_en}
                    onChange={(e) => setFormData({ ...formData, field_label_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="เช่น First Name"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  ประเภทฟิลด์ <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.field_type}
                  onChange={(e) => setFormData({ ...formData, field_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {fieldTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Options for select, radio, checkbox */}
              {['select', 'radio', 'checkbox'].includes(formData.field_type) && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    ตัวเลือก (Options)
                  </label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option.value}
                          onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="Value"
                        />
                        <input
                          type="text"
                          value={option.label_th}
                          onChange={(e) => handleOptionChange(index, 'label_th', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="ป้ายกำกับ (ไทย)"
                        />
                        <input
                          type="text"
                          value={option.label_en}
                          onChange={(e) => handleOptionChange(index, 'label_en', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded-md text-sm"
                          placeholder="Label (EN)"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                        >
                          ลบ
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                    >
                      เพิ่มตัวเลือก
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mb-4 flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_required}
                    onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
                    className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 text-sm font-bold">ฟิลด์จำเป็น</span>
                </label>
                
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 text-sm font-bold">เปิดใช้งานทันที</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  {editingField ? 'บันทึกการแก้ไข' : 'เพิ่มฟิลด์'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFormFieldManager;
