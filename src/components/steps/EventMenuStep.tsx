import React, { useRef } from "react";
import type { EventData } from "../CreateEventWizard";

interface EventMenuStepProps {
  data: EventData;
  onUpdate: (updates: Partial<EventData>) => void;
  onFinish: () => void;
  onBack: () => void;
}

const EventMenuStep = ({
  data,
  onUpdate,
  onFinish,
  onBack,
}: EventMenuStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMenuItemChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedMenuItems = [...data.menuItems];
    updatedMenuItems[index] = { ...updatedMenuItems[index], [field]: value };
    onUpdate({ menuItems: updatedMenuItems });
  };

  const handleImageUpload = (index: number, file: File) => {
    // In a real app, you'd upload the file to a server and get a URL back
    const imageUrl = URL.createObjectURL(file);
    handleMenuItemChange(index, "image", imageUrl);
  };

  const addFood = () => {
    const newMenuItem = {
      id: Date.now().toString(),
      name: "Burger",
      price: "2000",
      description: "Describe your Food here",
      quantity: "40",
    };
    onUpdate({ menuItems: [...data.menuItems, newMenuItem] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFinish();
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 ml-9">
      <div className="mb-6">
        <h3 className="mb-4 text-lg font-semibold text-[#CDCDE0]">
          Event Menu
        </h3>
      </div>

      <div className="space-y-8">
        {data.menuItems.map((item, index) => (
          <div key={item.id} className="space-y-6">
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
                    onChange={(e) =>
                      handleMenuItemChange(index, "name", e.target.value)
                    }
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
                  <div className="w-full h-32 bg-[#1A1A1A] rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-pink-500 transition-colors">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt="Food preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div
                        className="text-[#CDCDE0] text-center"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <p>Upload Food Image</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
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
                    onChange={(e) =>
                      handleMenuItemChange(index, "quantity", e.target.value)
                    }
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
                    Food Price
                  </label>
                  <input
                    type="text"
                    value={item.price}
                    onChange={(e) =>
                      handleMenuItemChange(index, "price", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleMenuItemChange(index, "description", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-[#1A1A1A] rounded-lg text-white placeholder-[#CDCDE0] focus:outline-none focus:border-pink-500 transition-colors h-32 resize-none"
                    placeholder="Describe your Food here"
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
            Add Food
          </button>
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
          Create Event
        </button>
      </div>
    </form>
  );
};

export default EventMenuStep;
