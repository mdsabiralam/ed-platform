export const getIdCardTemplate = (data: {
  name: string;
  class: string;
  dob: string;
  address: string;
  photo_url: string;
  qr_code: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      width: 85.6mm;
      height: 53.98mm;
      box-sizing: border-box;
      /* Safe margin/bleed area logic can be handled by padding or internal container */
      padding: 3mm;
      background-color: #f0f0f0;
    }
    .id-card {
      width: 100%;
      height: 100%;
      background: white;
      border: 1px solid #ccc;
      border-radius: 5px;
      display: flex;
      flex-direction: row;
      overflow: hidden;
      position: relative;
    }
    .photo-section {
      width: 35%;
      background-color: #e6e6e6;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    .photo {
      width: 80%;
      height: auto;
      border-radius: 5px;
      background-color: #ddd;
      object-fit: cover;
    }
    .details-section {
      width: 65%;
      padding: 5px 10px;
      font-size: 8px;
    }
    .school-name {
      font-size: 10px;
      font-weight: bold;
      color: #333;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .student-name {
      font-size: 12px;
      font-weight: bold;
      color: #000;
      margin-bottom: 3px;
    }
    .label {
      font-weight: bold;
      color: #555;
    }
    .row {
      margin-bottom: 2px;
    }
    .qr-code {
      position: absolute;
      bottom: 5px;
      right: 5px;
      width: 30px;
      height: 30px;
    }
  </style>
</head>
<body>
  <div class="id-card">
    <div class="photo-section">
      <img src="${data.photo_url || 'https://via.placeholder.com/150'}" class="photo" alt="Student Photo" />
    </div>
    <div class="details-section">
      <div class="school-name">Ed Platform School</div>
      <div class="student-name">${data.name}</div>
      <div class="row"><span class="label">Class:</span> ${data.class}</div>
      <div class="row"><span class="label">DOB:</span> ${data.dob}</div>
      <div class="row"><span class="label">Address:</span> ${data.address}</div>
    </div>
    <img src="${data.qr_code}" class="qr-code" alt="QR Code" />
  </div>
</body>
</html>
`;

export const getAdmissionLetterTemplate = (data: {
  name: string;
  academic_year: string;
  fee_details: string;
  date: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      margin: 40px;
      line-height: 1.6;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      text-decoration: underline;
    }
    .content {
      font-size: 14px;
    }
    .footer {
      margin-top: 60px;
      display: flex;
      justify-content: space-between;
    }
    .signature {
      border-top: 1px solid #333;
      padding-top: 5px;
      width: 200px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Ed Platform School</h1>
    <div class="title">Admission Acceptance Letter</div>
  </div>

  <div class="content">
    <p>Date: ${data.date}</p>
    <p>Dear <strong>${data.name}</strong>,</p>

    <p>We are pleased to inform you that your admission to <strong>Ed Platform School</strong> for the Academic Year <strong>${data.academic_year}</strong> has been confirmed.</p>

    <p>Please find the fee details below:</p>
    <p><strong>${data.fee_details}</strong></p>

    <p>We look forward to a successful academic journey together.</p>
  </div>

  <div class="footer">
    <div class="signature">Authorized Signatory</div>
    <div class="signature">Principal</div>
  </div>
</body>
</html>
`;
