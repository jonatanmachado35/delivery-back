import { BadRequestException, Logger } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';

export class Storage {
  private logger = new Logger('Storage');

  constructor() {
    cloudinary.config({
      cloud_name: process.env.FILE_CLOUD_NAME,
      api_key: process.env.FILE_CLOUD_API_KEY,
      api_secret: process.env.FILE_CLOUD_SECRET,
    });
  }

  async create(
    file: Express.Multer.File,
    folder = 'img',
  ): Promise<UploadApiResponse> {
    try {
      this.logger.log('Uploading file to cloudinary');
      const { mimetype, buffer } = file as {
        mimetype: string;
        buffer: Buffer;
      };

      const result = await cloudinary.uploader.upload(
        `data:${mimetype};base64,${buffer.toString('base64')}`,
        {
          use_filename: true,
          unique_filename: false,
          overwrite: true,
          resource_type: 'auto',
          folder: 'QUICK/'.concat(folder),
        },
      );

      if (!result) {
        this.logger.error('File not uploaded');
        throw new Error('File not uploaded');
      }
      return result;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      throw error;
    }
  }

  async delete(public_id: string): Promise<{ result: string }> {
    try {
      this.logger.log(`Deleting file with public_id: ${public_id}`);

      const result = await cloudinary.uploader
        .destroy(public_id)
        .then((res) => {
          return res as { result: string };
        });

      if (result.result !== 'ok') {
        throw new BadRequestException(
          `Delete file: ${result.result} for ${public_id}`,
        );
      }

      return result;
    } catch (error) {
      this.logger.error(`Error deleting file ${public_id}:`, error);
      throw error;
    }
  }
}
