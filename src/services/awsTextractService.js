import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";

/**
 * AWSTextract Service for fast, robust OCR without Gemini or Tesseract.
 */

function blobToBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

export async function extractTextWithAWS(fileBlob, onProgress) {
  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
  const region = import.meta.env.VITE_AWS_REGION || "us-east-1";

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials missing in .env (VITE_AWS_ACCESS_KEY_ID, VITE_AWS_SECRET_ACCESS_KEY)');
  }

  const client = new TextractClient({
    region,
    credentials: { accessKeyId, secretAccessKey }
  });

  onProgress?.("Uploading to AWS Textract...");
  const buffer = await blobToBuffer(fileBlob);

  const command = new DetectDocumentTextCommand({
    Document: { Bytes: buffer }
  });

  onProgress?.("AWS analyzing document...");
  const response = await client.send(command);

  if (!response.Blocks) return "";

  // Filter for LINE blocks and concatenate
  const lines = response.Blocks
    .filter(block => block.BlockType === "LINE")
    .map(block => block.Text);

  return lines.join("\n");
}
