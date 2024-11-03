'use client';
import React, { useState, useEffect } from 'react';
import { Upload, X, Edit, Trash2 } from 'lucide-react';

interface MenuItem {
  _id?: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  ingredients: string;
  imageData?: string;
}

interface RestaurantSettings {
  logoData?: string;
}

const RestaurantAdmin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('menu');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [existingMenu, setExistingMenu] = useState<MenuItem[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings>({});
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState<MenuItem>({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    ingredients: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchExistingMenu();
      fetchSettings();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (activeTab === 'add' && !editingItem) {
      setSuccessMessage('');
      setNewItem({
        title: '',
        description: '',
        price: '',
        currency: 'USD',
        ingredients: '',
      });
    }
  }, [activeTab]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/restaurant/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchExistingMenu = async () => {
    try {
      const response = await fetch('/api/restaurant');
      const data = await response.json();
      if (data.success) {
        setExistingMenu(data.menu || []);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Use admin/admin');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        try {
          const response = await fetch('/api/restaurant/settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              logoData: base64Data,
            }),
          });
          
          if (response.ok) {
            setSettings({ ...settings, logoData: base64Data });
          }
        } catch (error) {
          console.error('Error uploading logo:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMenuImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem({ ...newItem, imageData: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem(item);
    setActiveTab('add');
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setNewItem({
      title: '',
      description: '',
      price: '',
      currency: 'USD',
      ingredients: '',
    });
  };

  const handleDelete = async (id: string) => {
    setDeleteItemId(id);
    setIsDeleting(true);
  };

  const confirmDelete = async () => {
    if (!deleteItemId) return;

    try {
      const response = await fetch(`/api/restaurant?id=${deleteItemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExistingMenu(existingMenu.filter(item => item._id !== deleteItemId));
        setSuccessMessage('Item deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setIsDeleting(false);
      setDeleteItemId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const submitData = editingItem ? { ...newItem, _id: editingItem._id } : newItem;

      const response = await fetch('/api/restaurant', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        setSuccessMessage(editingItem ? 'Item updated successfully!' : 'Item added successfully!');
        setNewItem({
          title: '',
          description: '',
          price: '',
          currency: 'USD',
          ingredients: '',
        });
        setEditingItem(null);
        fetchExistingMenu();
      }
    } catch (error) {
      setSuccessMessage(editingItem ? 'Error updating item' : 'Error adding item');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-center text-primary">Restaurant Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {loginError && (
              <div className="text-red-500 text-sm text-center">{loginError}</div>
            )}
            <button
              type="submit"
              className="w-full bg-primary text-white p-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Login
            </button>
            <div className="text-sm text-gray-500 text-center">
              Use admin/admin to login
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16">
                {settings.logoData ? (
                  <img
                    src={settings.logoData}
                    alt="Restaurant Logo"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer hover:bg-primary/90"
                >
                  <Upload className="w-4 h-4" />
                </label>
              </div>
              <h1 className="text-2xl font-bold">Restaurant Admin</h1>
            </div>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Logout
            </button>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('menu')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'menu'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              Existing Menu
            </button>
            <button
              onClick={() => {
                setActiveTab('add');
                setEditingItem(null);
              }}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'add'
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {editingItem ? 'Editing Item' : 'Add New Item'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'menu' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Existing Menu Items</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {existingMenu.map((item) => (
                  <div key={item._id} className="border rounded-lg overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9">
                      {item.imageData ? (
                        <img
                          src={item.imageData}
                          alt={item.title}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-600 mb-2">{item.description}</p>
                      <p className="text-gray-600 mb-2">
                        Ingredients: {item.ingredients}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primary">
                          {item.price} {item.currency}
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id!)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
                {editingItem && (
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Menu Item Image
                  </label>
                  <div className="relative">
                    {newItem.imageData ? (
                      <div className="relative w-full h-48">
                        <img
                          src={newItem.imageData}
                          alt="Menu Item Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewItem({ ...newItem, imageData: undefined });
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMenuImageUpload}
                          className="hidden"
                          id="menu-image-upload"
                        />
                        <label
                          htmlFor="menu-image-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">
                            Click to upload menu item image
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Item Title
                  </label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) =>
                      setNewItem({ ...newItem, title: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ingredients
                  </label>
                  <textarea
                    value={newItem.ingredients}
                    onChange={(e) =>
                      setNewItem({ ...newItem, ingredients: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      value={newItem.price}
                      onChange={(e) =>
                        setNewItem({ ...newItem, price: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-medium mb-1">
                      Currency
                    </label>
                    <select
                      value={newItem.currency}
                      onChange={(e) =>
                        setNewItem({ ...newItem, currency: e.target.value })
                      }
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                </div>
                {successMessage && (
                  <div className="text-green-500 text-center p-3 bg-green-50 rounded-lg">
                    {successMessage}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full bg-primary text-white p-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {editingItem ? 'Update Menu Item' : 'Add Menu Item'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this menu item? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsDeleting(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantAdmin;