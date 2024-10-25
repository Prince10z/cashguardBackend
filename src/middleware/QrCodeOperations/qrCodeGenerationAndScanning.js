const qrcode = require("qrcode"); // For generating QR codes
const { v4: uuidv4 } = require("uuid");
// Function to generate a unique QR code
const generateUniqueQRCode = async (uniqueId) => {
  try {
    const timestamp = new Date().toISOString();

    // Create a unique string combining uniqueId and timestamp
    const qrCodeData = `${uniqueId}${timestamp}`;

    // Generate QR code for the combined data
    const qrCodeImage = await qrcode.toDataURL(qrCodeData);
    return qrCodeImage;
  } catch (error) {
    console.error("Error generating QR code:", error);
    return null;
  }
};
const generateUniqueIds = () => {
  try {
    const timestamp = new Date().toISOString();
    let uniqueId = uuidv4();
    // Create a unique string combining uniqueId and timestamp
    const qrCodeData = `${uniqueId}${timestamp}`;

    return qrCodeData;
  } catch (error) {
    console.error("Error in generating UniqueId:", error);
    return null;
  }
};

module.exports = { generateUniqueQRCode, generateUniqueIds };
