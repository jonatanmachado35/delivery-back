import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Storage } from './storage.service';
import { File } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FileStorageService implements OnModuleInit {
  static readonly storage = new Storage();
  private logger = new Logger(FileStorageService.name);

  constructor(private prisma: PrismaService) {}

  onModuleInit(): void {
    const notExists = [
      'FILE_CLOUD_NAME',
      'FILE_CLOUD_API_KEY',
      'FILE_CLOUD_SECRET',
    ].filter((key) => !process.env[key]);

    if (notExists.length) {
      // eslint-disable-next-line no-console
      console.error(
        `\n\n\n\x1b[33mEnvironment variables \x1b[31m${notExists.join(', ')}\x1b[33m not found\x1b[0m`,
      );
      process.exit();
    }
  }

  async upsert(
    newFile: Express.Multer.File,
    folder: string[],
    file?: File,
  ): Promise<Pick<File, 'id'>> {
    const filename = newFile.originalname?.split('.')?.[0];

    if (file) {
      const { id, publicId } = file as {
        filename: string;
        id: number;
        publicId: string;
        size: number;
      };

      await FileStorageService.storage
        .delete(publicId)
        .catch((err: Error & { error: Error }) => {
          this.logger.error(err, err.stack);

          throw new BadRequestException(err.error?.message ?? err?.message, {
            cause: FileStorageService.name,
            description: 'delete',
          });
        });

      const uploaded = await FileStorageService.storage
        .create(newFile, folder.join('/'))
        .catch((err: Error & { error: Error }) => {
          this.logger.error(err, err.stack);

          throw new BadRequestException(err.error?.message ?? err?.message, {
            cause: FileStorageService.name,
            description: 'create',
          });
        });

      return await this.prisma.file.update({
        where: { id },
        data: {
          mimetype: uploaded.format,
          size: uploaded.bytes,
          publicId: uploaded.public_id,
          path: uploaded.url,
          filename,
        },
        select: {
          id: true,
          path: true,
        },
      });
    }

    const uploaded = await FileStorageService.storage.create(
      newFile,
      folder.join('/'),
    );

    return this.prisma.file.create({
      data: {
        mimetype: uploaded.format,
        size: uploaded.bytes,
        publicId: uploaded.public_id,
        path: uploaded.url,
        filename,
      },
      select: {
        id: true,
        path: true,
      },
    });
  }
}
