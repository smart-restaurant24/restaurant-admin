import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { RestaurantSettings } from '../schema';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant';

export async function GET() {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      settings = new RestaurantSettings({});
      await settings.save();
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const data = await request.json();
    let settings = await RestaurantSettings.findOne();
    
    if (!settings) {
      settings = new RestaurantSettings(data);
    } else {
      settings.logoData = data.logoData;
      settings.updatedAt = new Date();
    }

    await settings.save();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}