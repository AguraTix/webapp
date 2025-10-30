import React, { useRef } from 'react';
import { Trash2, Upload } from 'lucide-react';
import type { EventData } from '../CreateEventWizard';

interface EditEventMenuStepProps {
  data: EventData;
  onUpdate: (updates: Partial<EventData>) => void;
  onSave: () => void;
  onBack: () => void;
}

const EditEventMenuStep = ({ data, onUpdate, onSave, onBack }: EditEventMenuStepProps) => {
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleMenuItemChange = (index: number, field: string, value: string) => {
    const updatedMenuItems = [...data.menuItems];
    updatedMenuItems[index] = { ...updatedMenuItems[index], [field]: value };
    onUpdate({ menuItems: updatedMenuItems });
  };

  const handleImageUpload = (index: number, file: File) => {
    // In a real app, you'd upload the file to a server and get a URL back
    const imageUrl = URL.createObjectURL(file);
    handleMenuItemChange(index, 'image', imageUrl);
  };

  const addFood = () => {
    const newMenuItem = {
      id: Date.now().toString(),
      name: '',
      price: '0',
      description: '',
      quantity: '0'
    };
    onUpdate({ menuItems: [...data.menuItems, newMenuItem] });
  };

  const removeMenuItem = (index: number) => {
    const updatedMenuItems = data.menuItems.filter((_, i) => i !== index);
    onUpdate({ menuItems: updatedMenuItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 ml-9">
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-semibold text-[#CDCDE0]">Update Event Menu</h3>
        <p className="text-sm text-gray-400">Modify food and beverage offerings</p>
      </div>

      <div className="space-y-8">
        {data.menuItems.map((item, index) => (
          <div key={item.id} className="relative p-6 bg-[#0F0F0F] rounded-lg border border-gray-800">
            <div className="absolute top-4 right-4">
              {data.menuItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMenuItem(index)}
                  className="p-2 text-red-400 transition-colors bg-red-900/20 rounded-lg hover:bg-red-900/40"
                  title="Remove menu item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Food Name */}
                <div>
                  <label className="block mb-2 text-sm font-normal text-white">
                    Food Name
                  </label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleMenuItemChange(index, 'name', e.target.value)}
                    className="w-full px-4 py-3 bg-[#1A1A1A] rounded-lg text-white placeholder-[#CDCDE0] focus:outline-none focus:border-pink-500 transition-colors"
                    placeholder="Enter food name"
                    required
                  />
                </div>

                {/* Food Image */}
                <div>
                  <label className="block mb-2 text-sm font-normal text-white">
                    Food Image
                  </label>
                  <div className="relative w-full h-32 bg-[#1A1A1A] rounded-lg border-2 border-dashed border-gray-600 overflow-hidden">
                    {item.image ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={item.image} 
                          alt="Food preview" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => fileInputRefs.current[item.id]?.click()}
                            className="px-3 py-2 text-sm text-white bg-pink-500 rounded hover:bg-pink-600 transition-colors"
                          >
                            Change Image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 transition-colors"
                        onClick={() => fileInputRefs.current[item.id]?.click()}
                      >
                        <Upload className="w-6 h-6 text-[#CDCDE0] mb-2" />
                        <p className="text-[#CDCDE0] text-sm text-center">Upload Food Image</p>
                      </div>
                    )}
                    <input
                      ref={(el) => fileInputRefs.current[item.id] = el}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(index, file);
                      }}
                    />
                  </div>
                </div>

                {/* Available Quantity */}
                <div>
                  <label className="block mb-2 text-sm font-normal text-white">
                    Available Quantity
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleMenuItemChange(index, 'quantity', e.target.value)}
                    className="w-full px-4 py-3 bg-[#1A1A1A] rounded-lg text-white placeholder-[#CDCDE0] focus:outline-none focus:border-pink-500 transition-colors"
                    placeholder="Enter quantity"
                    required
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Food Price */}
                <div>
                  <label className="block mb-2 text-sm font-normal text-white">
                    Food Price (RWF)
                  </label>
                  <input
                    type="text"
                    value={item.price}
                    onChange={(e) => handleMenuItemChange(index, 'price', e.target.value)}
                    className="w-full px-4 py-3 bg-[#1A1A1A] rounded-lg text-white placeholder-[#CDCDE0] focus:outline-none focus:border-pink-500 transition-colors"
                    placeholder="Enter price"
                    required
                  />
                </div>

                {/* Food Description */}
                <div>
                  <label className="block mb-2 text-sm font-normal text-white">
                    Food Description
                  </label>
                  <textarea
                    value={item.description}
                    onChange={(e) => handleMenuItemChange(index, 'description', e.target.value)}
                    className="w-full px-4 py-3 bg-[#1A1A1A] rounded-lg text-white placeholder-[#CDCDE0] focus:outline-none focus:border-pink-500 transition-colors h-32 resize-none"
                    placeholder="Describe your food here"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Food Button */}
        <div className="flex justify-center mt-6">
          <button
            type="button"
            onClick={addFood}
            className="px-8 py-3 font-semibold text-white transition-colors rounded-3xl bg-pink-500 hover:bg-pink-600"
          >
            Add Menu Item
          </button>
        </div>
      </div>

      {/* Menu Summary */}
      <div className="mt-8 p-4 bg-[#1A1A1A] rounded-lg">
        <h4 className="text-sm font-semibold text-[#CDCDE0] mb-3">Menu Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-300">Total Items: </span>
            <span className="text-sm font-semibold text-white">{data.menuItems.length}</span>
          </div>
          <div>
            <span className="text-sm text-gray-300">Total Quantity: </span>
            <span className="text-sm font-semibold text-white">
              {data.menuItems.reduce((total, item) => total + parseInt(item.quantity || '0'), 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={onBack}
          className="px-12 py-3 ml-9 font-semibold text-primary transition-colors bg-white rounded-3xl hover:bg-gray-200"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-12 py-3 mr-20 font-semibold text-white transition-colors rounded-3xl bg-pink-500 hover:bg-pink-600"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default EditEventMenuStep;