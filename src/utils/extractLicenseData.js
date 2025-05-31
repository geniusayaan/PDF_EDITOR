// src/utils/extractLicenseData.js

export function extractLicenseData(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let name = "";
  let dob = "";
  let blood = "";
  let father = "";
  let address = "Not Found";
  let licenseNumber = "";
  let issueDate = "";
  let validityNT = "";
  let validityTR = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!licenseNumber && /jk\d{2}\s*\d{10}/i.test(line)) {
      const match = line.match(/jk\d{2}\s*\d{10}/i);
      if (match) licenseNumber = match[0];
    }

    if (!name && /name[:\-\s]/i.test(line)) {
      name = line.split(/name[:\-]/i)[1]?.trim();
    }

    if (!dob && /date of birth[:\-\s]/i.test(line)) {
      const match = line.match(/\d{2}[\/\-]\d{2}[\/\-]\d{4}/);
      if (match) dob = match[0];
    }

    if (!blood && /blood group[:\-\s]/i.test(line)) {
      blood = line.split(/blood group[:\-]/i)[1]?.trim().toUpperCase();
    }

    if (!father && /(son|daughter|wife) of[:\-\s]/i.test(line)) {
      father = line.split(/of[:\-]/i)[1]?.trim();
    }

    if (!issueDate && /issue date[:\-\s]/i.test(line)) {
      const match = line.match(/\d{2}[\/\-]\d{2}[\/\-]\d{4}/);
      if (match) issueDate = match[0];
    }

    if ((!validityNT || !validityTR) && /validity\(nt\)|validity\(tr\)/i.test(line)) {
      const dateMatches = line.match(/\d{2}[\/\-]\d{2}[\/\-]\d{4}/g);
      if (dateMatches && dateMatches.length >= 2) {
        validityNT = dateMatches[0];
        validityTR = dateMatches[1];
      }
    }

    // Strict address extraction: get line immediately after the one containing "Address"
    if (line.toLowerCase().includes("address") && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();
      if (nextLine.length > 5) {
        address = nextLine;
      }
    }
  }

  return { name, dob, blood, father, address, licenseNumber, issueDate, validityNT, validityTR };
} 
