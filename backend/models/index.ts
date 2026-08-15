import mongoose, { Schema, Document } from 'mongoose';

// User Schema (for authentication)
const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', UserSchema);

// Profile Schema
const ProfileSchema = new Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner_name: { type: String, default: '' },
  shop_name: { type: String, default: '' },
  role: { type: String, default: 'retailer' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  pincode: { type: String, default: '' },
  profile_picture_url: { type: String, default: '' },
  custom_fields: { type: Schema.Types.Mixed, default: {} },
  date_of_birth: { type: String, default: '' },
  gender: { type: String, default: '' },
  is_active: { type: Boolean, default: true },
  is_open: { type: Boolean, default: true },
  latitude: { type: Number },
  longitude: { type: Number },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Virtual ID to match frontend's expectation of "id" field instead of "_id"
ProfileSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export const Profile = mongoose.model('Profile', ProfileSchema);

// Product Schema
const ProductSchema = new Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  expiry_date: { type: String, required: true },
  shop_name: { type: String },
  contact_phone: { type: String },
  owner_name: { type: String },
  shop_address: { type: String },
  shop_pincode: { type: String },
  image_url: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

ProductSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  }
});

export const Product = mongoose.model('Product', ProductSchema);

// Generic function to register models dynamically for DB routes
export const getModel = (collectionName: string) => {
  const collectionMap: Record<string, string> = {
    'users': 'User',
    'profiles': 'Profile',
    'products': 'Product'
  };
  
  const modelName = collectionMap[collectionName] || collectionName;

  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }
  
  const GenericSchema = new Schema({}, { strict: false });
  GenericSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    }
  });
  return mongoose.model(collectionName, GenericSchema, collectionName);
};
