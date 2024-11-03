import mongoose from 'mongoose';

// Menu Item Schema
export const MenuItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  ingredients: String,
  price: String,
  currency: String,
  imageData: String, // Store base64 image data
  createdAt: { type: Date, default: Date.now }
});

// Restaurant Settings Schema
export const RestaurantSettingsSchema = new mongoose.Schema({
  name: String,
  logoData: String, // Store base64 image data
  updatedAt: { type: Date, default: Date.now }
});

// Get or create models
export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);
export const RestaurantSettings = mongoose.models.RestaurantSettings || mongoose.model('RestaurantSettings', RestaurantSettingsSchema);