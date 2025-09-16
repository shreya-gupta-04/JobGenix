// backend/utils/datauri.js
import DataUriParser from "datauri/parser.js";
import path from "path";

const parser = new DataUriParser();

const getDataUri = (file) => {
  if (!file || !file.originalname || !file.buffer) return null;
  const extName = path.extname(file.originalname).toString();
  if (!extName) return null;
  const result = parser.format(extName, file.buffer);
  // result.content is the data-uri string like 'data:image/png;base64,...'
  return result?.content ?? null;
};

export default getDataUri;
