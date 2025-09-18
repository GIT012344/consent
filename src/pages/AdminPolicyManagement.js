import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select, Switch, message, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, CopyOutlined, EyeOutlined, EyeInvisibleOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

const { TextArea } = Input;
const { Option } = Select;

const AdminPolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [form] = Form.useForm();

  // Load policies
  const loadPolicies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/simple-policy`);
      if (response.data && response.data.success) {
        setPolicies(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading policies:', error);
      message.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  // Handle create/edit policy
  const handleSubmit = async (values) => {
    try {
      const url = editMode 
        ? `${API_BASE_URL}/api/simple-policy/${selectedPolicy.id}`
        : `${API_BASE_URL}/api/simple-policy`;
      
      const method = editMode ? 'put' : 'post';
      
      const response = await axios[method](url, values);
      
      if (response.data && response.data.success) {
        message.success(editMode ? 'Policy updated successfully' : 'Policy created successfully');
        setModalOpen(false);
        form.resetFields();
        loadPolicies();
      }
    } catch (error) {
      console.error('Error saving policy:', error);
      message.error('Failed to save policy');
    }
  };

  // Handle delete policy
  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/api/simple-policy/${id}`);
      if (response.data && response.data.success) {
        message.success('Policy deleted successfully');
        loadPolicies();
      }
    } catch (error) {
      console.error('Error deleting policy:', error);
      message.error('Failed to delete policy');
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (policy) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/simple-policy/${policy.id}`, {
        ...policy,
        is_active: !policy.is_active
      });
      
      if (response.data && response.data.success) {
        message.success(`Policy ${!policy.is_active ? 'activated' : 'deactivated'} successfully`);
        loadPolicies();
      }
    } catch (error) {
      console.error('Error toggling policy status:', error);
      message.error('Failed to update policy status');
    }
  };

  // Handle clone policy
  const handleClone = (policy) => {
    form.setFieldsValue({
      title: `${policy.title} (Copy)`,
      content: policy.content,
      user_type: policy.user_type,
      language: policy.language,
      version: policy.version,
      is_active: false
    });
    setEditMode(false);
    setModalOpen(true);
  };

  // Handle edit policy
  const handleEdit = (policy) => {
    setSelectedPolicy(policy);
    form.setFieldsValue(policy);
    setEditMode(true);
    setModalOpen(true);
  };

  // Handle create new policy
  const handleCreate = () => {
    form.resetFields();
    form.setFieldsValue({
      version: '1.0',
      is_active: true
    });
    setEditMode(false);
    setSelectedPolicy(null);
    setModalOpen(true);
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'User Type',
      dataIndex: 'user_type',
      key: 'user_type',
      width: 100,
      render: (type) => {
        const typeColors = {
          customer: 'blue',
          employee: 'green',
          partner: 'orange'
        };
        const typeLabels = {
          customer: 'ลูกค้า',
          employee: 'พนักงาน',
          partner: 'พาร์ทเนอร์'
        };
        return <Tag color={typeColors[type]}>{typeLabels[type] || type}</Tag>;
      }
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
      width: 100,
      render: (lang) => {
        const langLabels = {
          'th-TH': '🇹🇭 ไทย',
          'en-US': '🇬🇧 English'
        };
        return langLabels[lang] || lang;
      }
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      render: (version) => <Tag color="purple">v{version}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record)}
          checkedChildren={<EyeOutlined />}
          unCheckedChildren={<EyeInvisibleOutlined />}
        />
      )
    },
    {
      title: 'Created By',
      dataIndex: 'created_by',
      key: 'created_by',
      width: 120,
      ellipsis: true,
      render: (createdBy) => createdBy || 'Admin'
    },
    {
      title: 'Created Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => date ? new Date(date).toLocaleDateString('th-TH') : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="แก้ไข">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
          <Tooltip title="โคลน">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleClone(record)}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this policy?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="ลบ">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                style={{ color: '#ff4d4f' }}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex justify-between items-center">
            <span className="text-xl font-semibold">Policy Management</span>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadPolicies}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Create New Policy
              </Button>
            </Space>
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={policies}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} policies`
          }}
        />
      </Card>

      <Modal
        title={editMode ? 'Edit Policy' : 'Create New Policy'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="title"
              label="Policy Title"
              rules={[{ required: true, message: 'Please enter policy title' }]}
            >
              <Input placeholder="Enter policy title" />
            </Form.Item>

            <Form.Item
              name="version"
              label="Version"
              rules={[{ required: true, message: 'Please enter version' }]}
            >
              <Input placeholder="e.g., 1.0" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="user_type"
              label="User Type"
              rules={[{ required: true, message: 'Please select user type' }]}
            >
              <Select placeholder="Select user type">
                <Option value="customer">ลูกค้า (Customer)</Option>
                <Option value="employee">พนักงาน (Employee)</Option>
                <Option value="partner">พาร์ทเนอร์ (Partner)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="language"
              label="Language"
              rules={[{ required: true, message: 'Please select language' }]}
            >
              <Select placeholder="Select language">
                <Option value="th-TH">🇹🇭 ภาษาไทย</Option>
                <Option value="en-US">🇬🇧 English</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="content"
            label="Policy Content"
            rules={[{ required: true, message: 'Please enter policy content' }]}
          >
            <TextArea
              rows={10}
              placeholder="Enter policy content here..."
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Active Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setModalOpen(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editMode ? 'Update Policy' : 'Create Policy'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPolicyManagement;
