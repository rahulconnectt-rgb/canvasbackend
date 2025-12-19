import { Canvas } from "../models/canvas.model.js";
import { createCanvas, loadImage } from "canvas";
import PDFDocument from "pdfkit";

const initialiseCanva = async (req, res, next) => {
  try {
    const { name, height, width } = req?.body || {};

    //validations
    if (!name || typeof name !== "string" || name.trim() === "") {
      return res
        .status(400)
        .json({ success: false, error: "Name is required" });
    }
    if (!width || !height || width <= 0 || height <= 0) {
      return res
        .status(400)
        .json({ success: false, error: "Dimensions must be positive numbers" });
    }

    const newCanva = await Canvas.create({
      name: name.trim(),
      width,
      height,
      elements: [],
    });

    return res.status(201).json({
      success: "true",
      data: {
        id: newCanva._id,
      },
      message: "canvas created successfully",
    });
  } catch (error) {
    next(error);
  }
};

const addRectangle = async (req, res) => {
  try {
    const { id } = req.params;
    const { x, y, width, height, color = "#000000" } = req.body;

    //validations
    if (!width || !height || x < 0 || y < 0 || width <= 0 || height <= 0) {
      return res
        .status(400)
        .json({ success: false, error: "Dimensions must be positive numbers" });
    }

    const canvas = await Canvas.findById(id);
    if (!canvas)
      return res
        .status(404)
        .json({ success: false, message: "Canvas not found", data: null });

    canvas.elements.push({ type: "rectangle", x, y, width, height, color });

    await canvas.save();

    return res.status(201).json({
      success: true,
      message: "rectangle is added",
    });
  } catch (error) {
    next(error);
  }
};

const addCircle = async (req, res) => {
  try {
    const { id } = req.params;
    const { x, y, radius, color = "#000000" } = req.body;

    //validations
    if (!radius || radius <= 0) {
      return res
        .status(400)
        .json({ success: false, error: "Dimensions must be positive numbers" });
    }

    const canvas = await Canvas.findById(id);
    if (!canvas)
      return res
        .status(404)
        .json({ success: false, message: "Canvas not found", data: null });

    canvas.elements.push({ type: "circle", x, y, radius, color });

    await canvas.save();

    return res.status(201).json({
      success: true,
      message: "circle is added",
    });
  } catch (error) {
    next(error);
  }
};

const addText = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      text,
      x,
      y,
      fontSize = 12,
      fontFamily = "Arial",
      color = "#000000",
    } = req?.body || {};

    //validations
    if (!text || typeof text !== "string" || text.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "text is required" });
    }

    if (x < 0 || y < 0) {
      return res
        .status(400)
        .json({ success: false, error: "Dimensions must be positive numbers" });
    }

    const canvas = await Canvas.findById(id);
  
    if (!canvas)
      return res
        .status(404)
        .json({ success: false, message: "Canvas not found", data: null });

    canvas.elements.push({
      type: "text",
      text,
      x,
      y,
      fontSize,
      fontFamily,
      color,
    });

    await canvas.save();

    return res.status(201).json({
      success: true,
      message: "text is added",
    });
  } catch (error) {
    next(error);
  }
};

const addImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { x, y, width, height } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    if (x < 0 || y < 0) {
      return res.status(400).json({
        error: "Invalid position or dimensions",
      });
    }

    const canvas = await Canvas.findById(id);
    if (!canvas) {
      return res.status(404).json({ error: "Canvas not found" });
    }

    const img = await loadImage(req.file.path);

    canvas.elements.push({
      type: "image",
      x,
      y,
      width: width || img.width,
      height: height || img.height,
      imageUrl: req.file.path, // store path
    });

    await canvas.save();

    res.status(201).json({
      success: true,
      message: "Image added to canvas",
    });
  } catch (error) {
    next(error);
  }
};

const exportCanvasPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const canvasData = await Canvas.findById(id);

    if (!canvasData) {
      return res.status(404).json({ error: "Canvas not found" });
    }

    const DPI = 300;
    const scale = DPI / 96;

    const canvas = createCanvas(
      canvasData.width * scale,
      canvasData.height * scale
    );
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // IMPORTANT text fixes
    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    for (const el of canvasData.elements) {
      if (el.type === "rectangle") {
        ctx.fillStyle = el.color;
        ctx.fillRect(el.x, el.y, el.width, el.height);
      }

      if (el.type === "circle") {
        ctx.beginPath();
        ctx.arc(el.x, el.y, el.radius, 0, Math.PI * 2);
        ctx.fillStyle = el.color;
        ctx.fill();
      }

      if (el.type === "text") {
        ctx.font = `${el.fontSize}px ${el.fontFamily}`;
        ctx.fillStyle = el.color;
        ctx.fillText(el.text, el.x, el.y);
      }

      if (el.type === "image") {
        const img = await loadImage(el.imageUrl);
        ctx.drawImage(img, el.x, el.y, el.width, el.height);
      }
    }

    const buffer = canvas.toBuffer("image/png");

    const doc = new PDFDocument({
      size: [canvas.width, canvas.height],
      margin: 0,
      compress: true,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="canvas-${id}.pdf"`
    );

    doc.pipe(res);
    doc.image(buffer, 0, 0);
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "PDF export failed" });
  }
};

const getAllCanvas = async (req, res) => {
  try {
    const canvases = await Canvas.find().select("name _id");

    res.status(200).json({
      success: true,
      data: canvases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch canvas",
    });
  }
};

const getCanvas = async (req, res) => {
  try {
    const { id } = req.params;

    const canvas = await Canvas.findById(id);

    if (!canvas) {
      return res.status(404).json({
        success: false,
        message: "Canvas not found",
      });
    }

    res.status(200).json({
      success: true,
      data: canvas,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch canvas",
    });
  }
};

export {
  getAllCanvas,
  getCanvas,
  initialiseCanva,
  exportCanvasPdf,
  addText,
  addRectangle,
  addCircle,
  addImage,
};
