import { useEffect, useRef, useState } from "react";

export default function UploadImageResizer({ imageFile }) {
  const canvasSize = { x: 960, y: 540 };

  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);

  const [croppedImage, setCroppedImage] = useState(null);

  // Load image once
  useEffect(() => {
    if (!imageFile) return;

    const url = URL.createObjectURL(imageFile);
    const img = new Image();

    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = canvasSize.x;
      canvas.height = canvasSize.y;

      drawCanvas(ctx, img, offset, scale);
      URL.revokeObjectURL(url);
    };

    img.src = url;
  }, [imageFile]);

  // Redraw when offset changes
  useEffect(() => {
    if (!imgRef.current) return;
    drawCanvas(
      canvasRef.current.getContext("2d"),
      imgRef.current,
      offset,
      scale
    );
  }, [offset, scale]);

  if (!imageFile) return null;

  const handleCrop = () => {
    const canvas = canvasRef.current;

    const maskWidth = 640;
    const maskHeight = 360;
    const maskX = (canvas.width - maskWidth) / 2;
    const maskY = (canvas.height - maskHeight) / 2;

    // Create an offscreen canvas
    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = maskWidth;
    cropCanvas.height = maskHeight;
    const cropCtx = cropCanvas.getContext("2d");

    // Draw only the mask area from the main canvas
    cropCtx.drawImage(
      canvas,
      maskX,
      maskY,
      maskWidth,
      maskHeight,
      0,
      0,
      maskWidth,
      maskHeight
    );

    const dataUrl = cropCanvas.toDataURL("image/png");
    setCroppedImage(dataUrl);
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: `${canvasSize.x}px`,
          height: `${canvasSize.y}px`,
          display: "block",
          border: "1px solid #ccc",
        }}
      />

      <h3>Move Horizontally:</h3>
      <input
        type="range"
        min={-canvasSize.x / 2}
        max={canvasSize.x / 2}
        value={offset.x}
        onChange={(e) => setOffset({ ...offset, x: Number(e.target.value) })}
        style={{ width: `${canvasSize.x}px`, marginTop: "0.5rem" }}
      />

      <h3>Move Vertically:</h3>
      <input
        type="range"
        min={-canvasSize.y / 2}
        max={canvasSize.y / 2}
        value={offset.y}
        onChange={(e) => setOffset({ ...offset, y: Number(e.target.value) })}
        style={{ width: `${canvasSize.x}px`, marginTop: "0.5rem" }}
      />

      <h3>Scale Image:</h3>
      <input
        type="range"
        min={0.1}
        max={2}
        step={0.001}
        value={scale}
        onChange={(e) => setScale(Number(e.target.value))}
        style={{ width: `${canvasSize.x}px`, marginTop: "0.5rem" }}
      />

      <h3>Crop And Save:</h3>
      <button onClick={handleCrop} style={{ marginTop: "1rem" }}>
        Crop Image
      </button>

      {croppedImage && (
        <div style={{ marginTop: "1rem" }}>
          <h3>Cropped Image:</h3>
          <img src={croppedImage} alt="Cropped" style={{ maxWidth: "100%" }} />
        </div>
      )}
    </div>
  );
}

const drawCanvas = (ctx, img, offset, scale) => {
  clearCanvas(ctx);
  drawImage(ctx, img, offset, scale);
  drawMask(ctx);
};

const clearCanvas = (ctx) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

const drawImage = (ctx, img, offset, scale = 1) => {
  const imgAspect = img.width / img.height;
  const canvasAspect = ctx.canvas.width / ctx.canvas.height;

  let drawWidth, drawHeight;

  if (imgAspect > canvasAspect) {
    drawWidth = ctx.canvas.width;
    drawHeight = ctx.canvas.width / imgAspect;
  } else {
    drawHeight = ctx.canvas.height;
    drawWidth = ctx.canvas.height * imgAspect;
  }

  // Compute the center position of the image
  const centerX = (ctx.canvas.width - drawWidth) / 2 + offset.x + drawWidth / 2;
  const centerY =
    (ctx.canvas.height - drawHeight) / 2 + offset.y + drawHeight / 2;

  // Apply scale to width/height
  const scaledWidth = drawWidth * scale;
  const scaledHeight = drawHeight * scale;

  // Compute top-left so the center stays the same
  const drawX = centerX - scaledWidth / 2;
  const drawY = centerY - scaledHeight / 2;

  ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);
};

const drawMask = (ctx) => {
  const rectWidth = 640;
  const rectHeight = 360;
  const x = (ctx.canvas.width - rectWidth) / 2;
  const y = (ctx.canvas.height - rectHeight) / 2;

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, ctx.canvas.width, y); // top
  ctx.fillRect(
    0,
    y + rectHeight,
    ctx.canvas.width,
    ctx.canvas.height - (y + rectHeight)
  ); // bottom
  ctx.fillRect(0, y, x, rectHeight); // left
  ctx.fillRect(
    x + rectWidth,
    y,
    ctx.canvas.width - (x + rectWidth),
    rectHeight
  ); // right

  ctx.strokeStyle = "red";
  ctx.lineWidth = 0.5;
  ctx.strokeRect(x - 1, y - 1, rectWidth + 2, rectHeight + 2);
};
