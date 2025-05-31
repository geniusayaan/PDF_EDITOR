export function extractLicenseData(rawText) {
  const lines = rawText.split('\n').map(line => line.trim()).filter(Boolean);

  let name = '', dob = '', blood = '', father = '', address = '';

  for (const line of lines) {
    const lower = line.toLowerCase();

    // 1. Name
    if (lower.includes('name') && !name) {
      const match = line.match(/name[:\s]*([A-Z\s]+)/i);
      name = match?.[1]?.trim() || '';
    }

    // 2. DOB
    if ((lower.includes('dob') || lower.includes('date of birth')) && !dob) {
      const match = line.match(/(\d{2}-\d{2}-\d{4})/);
      dob = match?.[1] || '';
    }

    // 3. Blood Group
    if (lower.includes('blood') && !blood) {
      const match = line.match(/blood\s*group[:\s]*([A-Z+-]+)/i);
      blood = match?.[1]?.toUpperCase() || 'N/A';
    }

    // 4. Father / Spouse
    if ((lower.includes('son') || lower.includes('wife') || lower.includes('daughter')) && !father) {
      const match = line.match(/of[:\s]*([A-Z\s]+)/i);
      father = match?.[1]?.trim() || '';
    }

    // 5. Address
    if (lower.includes('address') && !address) {
      const parts = line.split(/address[:\s]*/i);
      address = parts[1]?.trim() || '';
    }
  }

  // Cleanup garbage symbols
  name = name.replace(/[^A-Z\s]/gi, '').trim();
  father = father.replace(/[^A-Z\s]/gi, '').trim();

  return {
    name: name || 'Not Found',
    dob: dob || 'Not Found',
    blood: blood || 'N/A',
    father: father || 'Not Found',
    address: address || 'Not Found',
  };
}
