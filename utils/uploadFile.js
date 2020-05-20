// const { createWriteStream, mkdir } = require('fs');
// const uuid = require('uuid');

// const storeUpload = async ({ stream, filename, mimetype }) => {
//   const id = uuid();
//   const path = `images/${id}-${filename}`;
//   // (createWriteStream) writes our file to the images directory
//   return new Promise((resolve, reject) =>
//     stream
//       .pipe(createWriteStream(path))
//       .on('finish', () => resolve({ id, path, filename, mimetype }))
//       .on('error', reject)
//   );
// };

// const processUpload = async (upload) => {
//   const { createReadStream, filename, mimetype } = await upload;
//   const stream = createReadStream();
//   const file = await storeUpload({ stream, filename, mimetype });
//   return file;
// };

// export default processUpload;
