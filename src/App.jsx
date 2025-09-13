import { useState } from "react";
import UploadButton from "./components/upload-button/upload-button";
import UploadImageResizer from "./components/upload-image/upload-image";

export default function App() {
  const [imageFile, setImageFile] = useState(null);

  return (
    <>
      <h1>React Playground</h1>
      <UploadButton onImageSelected={setImageFile} />
      {imageFile && <UploadImageResizer imageFile={imageFile} />}
    </>
  );
}
