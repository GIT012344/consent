import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import { Plus, Download, Eye, Edit, Copy, Power, Filter, Search, Calendar, Users, Globe, AlertCircle, Trash2 } from 'lucide-react';

const PolicyManager = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [error, setError] = useState(null);
  const [availableUserTypes, setAvailableUserTypes] = useState([
    'customer',
    'employee', 
    'partner'
  ]);
  const [newUserType, setNewUserType] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [filters, setFilters] = useState({
    tenant: '',
    kind: '',
    status: '',
    search: ''
  });

  // Form data for create/edit
  const [formData, setFormData] = useState({
    tenant: 'default',
    kind: 'privacy',
    version: '',
    title: '',
    content: '',
    language: 'th',
    userTypes: ['customer'], // Changed from single userType to array
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    mandatory: true,
    cloneFromId: null
  });
  

  useEffect(() => {
    fetchPolicies();
    fetchUserTypes();
  }, []);

  const fetchUserTypes = async () => {
    try {
      // Fetch existing user types from policies
      const response = await axios.get(`${API_BASE_URL}/api/consent/versions`);
      const existingTypes = new Set(['customer', 'employee', 'partner']);
      
      response.data.data?.forEach(policy => {
        if (policy.user_type) {
          existingTypes.add(policy.user_type);
        }
      });
      
      setAvailableUserTypes(Array.from(existingTypes));
    } catch (err) {
      console.error('Error fetching user types:', err);
    }
  };

  const fetchPolicies = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/consent/versions`);
      // Transform data to match Policy Manager format
      const transformedData = response.data.data?.map(v => ({
        id: v.id,
        tenant: 'default',
        kind: v.user_type === 'employee' ? 'employee_privacy' : 'privacy',
        version: v.version || '1.0',
        title: v.title,
        language: v.language || 'th',
        audiences: [v.user_type || 'customer'],
        userType: v.user_type || 'customer',
        effectiveFrom: v.created_at,
        effectiveTo: null,
        mandatory: true,
        status: v.is_active ? 'Active' : 'Inactive',
        content: v.content || v.description
      })) || [];
      setPolicies(transformedData);
    } catch (error) {
      console.error('Error fetching policies:', error);
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async (e) => {
    e.preventDefault();
    
    // Check if user selected at least one user type
    if (formData.userTypes.length === 0) {
      alert('Please select at least one user type');
      return;
    }
    
    // Check for existing active policies for selected user types
    const existingActives = [];
    formData.userTypes.forEach(userType => {
      const existing = policies.find(p => 
        p.status === 'Active' && 
        p.userType === userType && 
        p.language === formData.language
      );
      if (existing) existingActives.push(existing);
    });
    
    if (existingActives.length > 0) {
      const confirmMessage = `⚠️ There are active ${formData.language.toUpperCase()} policies for:\n${existingActives.map(p => `- ${p.userType}: "${p.title}" (v${p.version})`).join('\n')}\n\nCreating this new policy will deactivate them. Continue?`;
      if (!window.confirm(confirmMessage)) return;
    }
    
    try {
      // Create policy for each selected user type
      const promises = formData.userTypes.map(userType => {
        const payload = {
          title: formData.title,
          version: formData.version || '1.0',
          description: formData.title,
          content: formData.content,
          language: formData.language,
          user_type: userType,
          is_active: true
        };
        return axios.post('http://localhost:4000/api/policy/create', payload);
      });

      const responses = await Promise.all(promises);
      const successCount = responses.filter(r => r.data.success).length;
      
      if (successCount > 0) {
        alert(`Successfully created ${successCount} polic${successCount > 1 ? 'ies' : 'y'}!`);
        setShowCreateModal(false);
        resetForm();
        fetchPolicies();
      }
    } catch (error) {
      console.error('Error creating policy:', error);
      alert('Failed to create policy');
    }
  };

  const handleClonePolicy = (policy) => {
    setFormData({
      ...formData,
      tenant: policy.tenant,
      kind: policy.kind,
      version: policy.version + '.1',
      title: policy.title + ' (Copy)',
      content: policy.content,
      language: policy.language,
      userType: policy.userType,
      cloneFromId: policy.id
    });
    setShowCreateModal(true);
  };

  const handleDeactivate = async (policyId) => {
    if (!window.confirm('Deactivate this policy version immediately?')) return;
    
    try {
      await axios.put(`http://localhost:4000/api/consent/versions/${policyId}/toggle`);
      fetchPolicies();
    } catch (error) {
      console.error('Error deactivating policy:', error);
      alert('Failed to deactivate policy: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleActivate = async (id) => {
    try {
      await axios.put(`http://localhost:4000/api/consent/versions/${id}/toggle`);
      fetchPolicies();
    } catch (error) {
      console.error('Error activating policy:', error);
      alert('Failed to activate policy');
    }
  };

  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm('Are you sure you want to delete this policy? This action cannot be undone.')) return;
    
    try {
      const response = await axios.delete(`http://localhost:4000/api/consent/versions/${policyId}`);
      fetchPolicies();
      alert('Policy deleted successfully');
    } catch (error) {
      console.error('Error deleting policy:', error);
      // Check if it's because the policy has been used
      if (error.response?.status === 400) {
        alert('Cannot delete this policy because it has already been used in consent records. You can deactivate it instead.');
      } else {
        alert('Failed to delete policy: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handlePreview = (policy) => {
    setSelectedPolicy(policy);
    setShowPreviewModal(true);
  };

  const handleExportCSV = () => {
    const csv = [
      ['Tenant', 'Kind', 'Version', 'Language', 'Audiences', 'Effective From', 'Effective To', 'Mandatory', 'Status'],
      ...policies.map(p => [
        p.tenant,
        p.kind,
        p.version,
        p.language,
        p.audiences.join(';'),
        p.effectiveFrom,
        p.effectiveTo || '',
        p.mandatory,
        p.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `policies-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const resetForm = () => {
    setFormData({
      tenant: 'default',
      kind: 'privacy',
      version: '',
      title: '',
      content: '',
      language: 'th',
      userTypes: ['customer'], // Reset to default selection
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
      mandatory: true,
      cloneFromId: null
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'Scheduled': 'bg-blue-100 text-blue-800',
      'Expired': 'bg-gray-100 text-gray-800',
      'Inactive': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredPolicies = policies.filter(p => {
    if (filters.tenant && p.tenant !== filters.tenant) return false;
    if (filters.kind && p.kind !== filters.kind) return false;
    if (filters.status && p.status !== filters.status) return false;
    if (filters.search && !p.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Policy Manager</h1>
        
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              className="border rounded px-3 py-2"
              value={filters.tenant}
              onChange={(e) => setFilters({...filters, tenant: e.target.value})}
            >
              <option value="">All Tenants</option>
              <option value="default">Default</option>
            </select>

            <select
              className="border rounded px-3 py-2"
              value={filters.kind}
              onChange={(e) => setFilters({...filters, kind: e.target.value})}
            >
              <option value="">All Kinds</option>
              <option value="privacy">Privacy</option>
              <option value="terms">Terms</option>
              <option value="employee_privacy">Employee Privacy</option>
            </select>

            <select
              className="border rounded px-3 py-2"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Expired">Expired</option>
              <option value="Inactive">Inactive</option>
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="border rounded pl-10 pr-3 py-2 w-full"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Policy Version
              </button>
              <button
                onClick={handleExportCSV}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kind</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Version</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effective From→To</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mandatory</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPolicies.map((policy) => (
                <tr key={policy.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{policy.tenant}</td>
                  <td className="px-4 py-3 text-sm">{policy.kind}</td>
                  <td className="px-4 py-3 text-sm font-medium">{policy.version}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {policy.language.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {policy.userType === 'customer' ? 'Customer (ลูกค้า)' : 
                       policy.userType === 'employee' ? 'Employee (พนักงาน)' : 
                       policy.userType === 'partner' ? 'Partner (พาร์ทเนอร์)' : policy.userType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      {new Date(policy.effectiveFrom).toLocaleDateString()}
                      {policy.effectiveTo && (
                        <>
                          <span>→</span>
                          {new Date(policy.effectiveTo).toLocaleDateString()}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {policy.mandatory ? (
                      <span className="text-red-600">✓ Required</span>
                    ) : (
                      <span className="text-gray-400">Optional</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(policy.status)}`}>
                        {policy.status}
                      </span>
                      {/* Show warning if multiple active for same userType+language */}
                      {policy.status === 'Active' && 
                       filteredPolicies.filter(p => 
                         p.status === 'Active' && 
                         p.userType === policy.userType && 
                         p.language === policy.language
                       ).length > 1 && (
                        <span className="text-yellow-600" title="Multiple active policies for same user type and language">
                          ⚠️
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePreview(policy)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleClonePolicy(policy)}
                        className="text-green-600 hover:text-green-800"
                        title="Clone"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      {policy.status === 'Active' ? (
                        <button
                          onClick={() => handleDeactivate(policy.id)}
                          className="text-orange-600 hover:text-orange-800"
                          title="Deactivate"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(policy.id)}
                          className="text-green-600 hover:text-green-800"
                          title="Activate"
                        >
                          <Power className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePolicy(policy.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Clone Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {formData.cloneFromId ? 'Clone Policy Version' : 'Create Policy Version'}
            </h2>
            
            <form onSubmit={handleCreatePolicy}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tenant</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formData.tenant}
                    onChange={(e) => setFormData({...formData, tenant: e.target.value})}
                    placeholder="e.g., default, company-x"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Kind</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formData.kind}
                    onChange={(e) => setFormData({...formData, kind: e.target.value})}
                    placeholder="e.g., privacy, terms, consent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Version</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    placeholder="e.g., 1.0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Language</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    required
                  >
                    <option value="th">Thai</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">User Types (Select Multiple)</label>
                  <div className="space-y-2">
                    <div className="border rounded p-3 max-h-40 overflow-y-auto">
                      {availableUserTypes.map(type => (
                        <label key={type} className="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={formData.userTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({...formData, userTypes: [...formData.userTypes, type]});
                              } else {
                                setFormData({...formData, userTypes: formData.userTypes.filter(t => t !== type)});
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm">
                            {type === 'customer' ? 'Customer (ลูกค้า)' : 
                             type === 'employee' ? 'Employee (พนักงาน)' : 
                             type === 'partner' ? 'Partner (พาร์ทเนอร์)' : type}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 border rounded px-3 py-2"
                        placeholder="Add new user type (e.g., vendor, contractor)"
                        value={newUserType}
                        onChange={(e) => setNewUserType(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newUserType && !availableUserTypes.includes(newUserType)) {
                              setAvailableUserTypes([...availableUserTypes, newUserType]);
                              setFormData({...formData, userType: newUserType});
                              setNewUserType('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newUserType && !availableUserTypes.includes(newUserType)) {
                            setAvailableUserTypes([...availableUserTypes, newUserType]);
                            setFormData({...formData, userTypes: [...formData.userTypes, newUserType]});
                            setNewUserType('');
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Add
                      </button>
                    </div>
                    {/* Show custom user types with delete button */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {availableUserTypes.filter(type => !['customer', 'employee', 'partner'].includes(type)).map(type => (
                        <div key={type} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                          <span className="text-sm">{type}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setAvailableUserTypes(availableUserTypes.filter(t => t !== type));
                              setFormData({...formData, userTypes: formData.userTypes.filter(t => t !== type)});
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Effective From</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={formData.effectiveFrom}
                    onChange={(e) => setFormData({...formData, effectiveFrom: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Effective To (Optional)</label>
                  <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={formData.effectiveTo}
                    onChange={(e) => setFormData({...formData, effectiveTo: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    className="w-full border rounded px-3 py-2"
                    rows="8"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Enter policy content (HTML supported)..."
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.mandatory}
                      onChange={(e) => setFormData({...formData, mandatory: e.target.checked})}
                    />
                    <span className="ml-2">Mandatory (Users must accept to proceed)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Preview before save
                    setSelectedPolicy({
                      ...formData,
                      status: 'Preview',
                      id: 'preview'
                    });
                    setShowPreviewModal(true);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Preview
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {formData.cloneFromId ? 'Clone Policy' : 'Create Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedPolicy.title}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Version {selectedPolicy.version} • {selectedPolicy.language.toUpperCase()} • {selectedPolicy.kind}
                </p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="border-t pt-4">
              {selectedPolicy.content ? (
                selectedPolicy.content.includes('<') && selectedPolicy.content.includes('>') ? (
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedPolicy.content }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans">{selectedPolicy.content}</pre>
                )
              ) : (
                <p className="text-gray-500 italic">No content available</p>
              )}
            </div>

            <div className="flex justify-end mt-6 gap-3">
              {selectedPolicy.id === 'preview' && (
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    // Go back to create modal
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  Back to Edit
                </button>
              )}
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyManager;
