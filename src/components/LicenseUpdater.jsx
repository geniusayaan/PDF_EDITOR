import { useState } from 'react';
import Tesseract from 'tesseract.js';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { extractLicenseData } from '../utils/extractLicenseData';

export default function LicenseUpdater() {
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setFields(null);
    setDownloadUrl(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const imageUrl = reader.result;
      setPreviewUrl(imageUrl); // Show image preview

      const { data: { text: rawText } } = await Tesseract.recognize(imageUrl, 'eng', {
        logger: m => console.log(m),
      });

      const parsed = extractLicenseData(rawText);
      console.log("📋 Parsed Data:", parsed);
      setFields(parsed);

      // Generate PDF
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595, 420]);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      page.drawText('INDIAN UNION DRIVING LICENCE', {
        x: 150, y: 380, size: 16, font, color: rgb(0, 0, 0.7)
      });
      page.drawText(`Name: ${parsed.name}`, { x: 50, y: 340, size: 12, font });
      page.drawText(`Date of Birth: ${parsed.dob}`, { x: 50, y: 320, size: 12, font });
      page.drawText(`Blood Group: ${parsed.blood}`, { x: 50, y: 300, size: 12, font });
      page.drawText(`Father/Spouse: ${parsed.father}`, { x: 50, y: 280, size: 12, font });
      page.drawText(`Address: ${parsed.address}`, { x: 50, y: 260, size: 12, font });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setLoading(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-sky-50 to-white p-4 flex flex-col items-center">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center text-blue-700">🪪 License Rebuilder</h1>

        <input type="file" accept="application/pdf,image/*" onChange={handleUpload}
          className="border p-2 rounded w-full text-sm" />

        {previewUrl && (
          <img src={previewUrl} alt="Uploaded preview"
            className="w-full h-auto rounded border shadow-sm" />
        )}

        {loading && (
          <p className="text-center text-gray-600 animate-pulse">
            🧠 Reading license with OCR...
          </p>
        )}

        {fields && (
          <div className="bg-blue-50 p-4 rounded-lg text-sm space-y-2">
            <h3 className="font-semibold text-blue-800">Extracted Info:</h3>
            <p><strong>Name:</strong> {fields.name}</p>
            <p><strong>DOB:</strong> {fields.dob}</p>
            <p><strong>Blood Group:</strong> {fields.blood}</p>
            <p><strong>Father/Spouse:</strong> {fields.father}</p>
            <p><strong>Address:</strong> {fields.address}</p>
          </div>
        )}

        {downloadUrl && (
          <a href={downloadUrl} download="New_License.pdf">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full mt-2">
              ⬇️ Download New License
            </button>
          </a>
        )}
      </div>
    </div>
  );
}
