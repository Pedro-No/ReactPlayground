import { useRef } from "react";

export default function UploadButton({ onImageSelected }) {
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImageSelected(file);
    }
  };

  return (
    <>
      <button onClick={handleButtonClick}>Upload Image</button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </>
  );
}
