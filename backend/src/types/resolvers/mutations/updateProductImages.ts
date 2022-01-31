import { mutationField, nonNull, stringArg } from 'nexus';
import { promises as fs, readFileSync } from 'fs';
import AdmZip = require('adm-zip');
import { uploadImage } from '../../services/aws/index';
import { UserInputError } from 'apollo-server-errors';

export const updateProductImages = mutationField('updateProductImages', {
  type: 'String',
  args: {
    data: nonNull(stringArg()),
    csvData: nonNull(stringArg())
  },
  resolve: async (_parent, { data, csvData }, ctx) => {
    const csvJson = JSON.parse(csvData);
    const dateObj = new Date();
    const month = dateObj.getUTCMonth() + 1; //months from 1-12
    const day = dateObj.getUTCDate();
    const year = dateObj.getUTCFullYear();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const timestamp = `${year}${month.toString().padStart(2, '0')}${day}${hours
      .toString()
      .padStart(2, '0')}${minutes.toString().padStart(2, '0')}`;

    const n = data.lastIndexOf(',');
    const result = data.substring(n + 1);
    const buff = Buffer.from(result, 'base64');

    await fs.mkdir('./temp', { recursive: true });
    await fs.writeFile('./temp/images.zip', buff, 'binary');
    try {
      const zip = new AdmZip('./temp/images.zip');
      const zipEntries = zip.getEntries();
      //check with  excel data
      const listOfImages = [];
      zipEntries.forEach(function (zipEntry) {
        listOfImages.push(zipEntry.entryName.toString());
      });
      const listOfImagesInCsv = csvJson.map((item) => item.image_file_name);

      if (JSON.stringify(listOfImagesInCsv.sort()) === JSON.stringify(listOfImages.sort())) {
        zip.extractAllTo('./temp/images');
        const files = await fs.readdir('./temp/images');
        //upload to aws
        for (let i = 0; i < files.length; i++) {
          const base64 = readFileSync(`./temp/images/${files[i]}`).toString('base64');
          const imageType = `.${files[i].split('.')[1]}`;
          const fileName = `${files[i].split('.')[0]}_${timestamp}${imageType}`;
          const imageUrl = await uploadImage(fileName, base64, imageType, 'productImages');
          const objectUrl = imageUrl.slice(imageUrl.lastIndexOf('/') + 1);
          const productId = csvJson
            .filter((item) => item.image_file_name === files[i])
            .map((item) => item.product_id);
          const response = await ctx.prisma.product.update({
            where: {
              id: productId[0]
            },
            data: {
              image: objectUrl
            }
          });
        }
        fs.rmdir('./temp', { recursive: true });
        return 'Success';
      } else {
        fs.rmdir('./temp', { recursive: true });
        throw new UserInputError('csv data and zip data does not tally');
      }
    } catch (e) {
      console.log(e);
    }
  }
});
