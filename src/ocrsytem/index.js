import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

const OCRApp = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [structuredData, setStructuredData] = useState([]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(URL.createObjectURL(file));
      setIsLoading(true);
      performOCR(file);
    }
  };

  const performOCR = (file) => {
    Tesseract.recognize(file, 'eng', {
      logger: m => console.log(m)
    }).then(({ data: { text } }) => {
      const structuredData = structureOCRData(text);
      setStructuredData(structuredData);
      setIsLoading(false);
    });
  };

  const structureOCRData = (text) => {
    // Split the text by lines
    const lines = text.split('\n');

    // Identify lines with items and amounts using a regular expression
    // This regex assumes that the amount is always at the end of the line
    // Adjust the regex to fit your specific bill formats
    const itemAmountRegex = /^(.+?)\s+(\d+\s+AED)$/;

    return lines.map(line => {
      const match = line.match(itemAmountRegex);
      return match ? [match[1].trim(), match[2]] : [];
    }).filter(line => line.length > 0);
  };

  return (
    <div>
      <input type="file" onChange={handleImageUpload} accept="image/*" />
      {isLoading && <p>Processing image, please wait...</p>}
      {uploadedImage && !isLoading && (
        <>
          <img src={uploadedImage} alt="Uploaded for OCR" style={{ maxWidth: '100%' }} />
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {structuredData.map((row, index) => (
                <tr key={index}>
                  <td style={{ border: '1px solid black', textAlign: 'left' }}>{row[0]}</td>
                  <td style={{ border: '1px solid black', textAlign: 'right' }}>{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default OCRApp;
