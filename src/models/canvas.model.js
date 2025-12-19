import mongoose from "mongoose";
import { Schema } from "mongoose";

const ElementSchema = new Schema({
  type: {
    type: String,
    enum: ["rectangle", "circle", "text", "image"],
    required: true,
  },
  x: Number,
  y: Number,
  width: Number,
  height: Number,
  radius: Number,
  color: String,
  text: String,
  fontSize: Number,
  fontFamily: String,
  imageUrl: String,
});

const CanvasSchema = new Schema({
  name: String,
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  elements: [ElementSchema],
});

export const Canvas = mongoose.model("Canvas", CanvasSchema);
