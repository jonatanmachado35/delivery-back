import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  ILocalization,
  ILocation,
  IRoute,
  ReverseResponse,
} from '../typing/location';
import { CacheService } from '../cache/cache.service';
import { PrismaService } from '../prisma/prisma.service';
import { AddressDto } from '../delivery/dto/delivery-simulate.dto';
import { Address } from '@prisma/client';

@Injectable()
export class LocationService implements OnModuleInit {
  private http: AxiosInstance;
  private logger = new Logger(LocationService.name);

  constructor(private cache: CacheService) {
    this.http = axios.create({
      baseURL: process.env.LOCATION_HOST,

      params: {
        key: process.env.LOCATION_KEY,
      },
    });
  }

  onModuleInit(): void {
    ['LOCATION_HOST', 'LOCATION_KEY'].forEach((env) => {
      if (!process.env[env]) {
        throw new Error(`Variável de ambiente ${env} não definida`);
      }
    });
  }

  async reverse(
    city: string,
    state: string,
    address: string,
    number: string,
    zipCode: string,
  ): Promise<ILocalization> {
    const query = `${number} ${address}, ${city}, ${state}, ${zipCode}`;

    this.logger.log(`Buscando localização para ${query}`);

    const key = `reverse:${query}`;

    const data = await this.cache.getValue(key);

    if (data) {
      this.logger.log(`Localização encontrada no cache para ${query}`);
      return JSON.parse(data) as ILocalization;
    }

    const response = await this.http
      .get<Array<ReverseResponse>>('/search', {
        params: {
          q: query,
          format: 'json',
        },
      })
      .then((res) => res.data)
      .catch((e: AxiosError) => {
        this.logger.error(e?.response?.data ?? e.message);
        throw new NotFoundException('Erro ao buscar localização');
      });

    const geoCode = {
      latitude: +response[0].lat,
      longitude: +response[0].lon,
    };

    await this.cache.setCache(key, JSON.stringify(geoCode));

    return geoCode;
  }

  async findDistance(
    origin: ILocalization,
    destination: ILocalization,
  ): Promise<IRoute> {
    const coordenates = encodeURIComponent(
      `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`,
    );
    const key = `distance:${coordenates}`;

    const data = await this.cache.getValue(key);

    if (data) {
      this.logger.log(`Rota encontrada no cache para ${coordenates}`);

      return JSON.parse(data) as IRoute;
    }

    this.logger.log(`Buscando rota para ${coordenates}`);
    const location = await this.http
      .get<ILocation>('/directions/driving/' + coordenates)
      .then((res) => res.data)
      .catch((e: AxiosError) => {
        this.logger.error(e);

        throw new NotFoundException('Erro ao calcular a rota');
      });

    const result = {
      distance: +Number(location.routes[0].distance / 1000).toFixed(3),
      duration: Math.floor(location.routes[0].duration / 60), // Convert to minutes
      geometry: location.routes[0].geometry,
    };

    await this.cache
      .setCache(key, JSON.stringify(result))
      .catch((e: Error) => this.logger.error(e.message));

    return result;
  }

  async getAddressLocalization(
    prisma: PrismaService,
    idAddress: number,
  ): Promise<ILocalization> {
    const coordinates = await prisma.$queryRaw<
      { longitude: number; latitude: number }[]
    >`
      SELECT
        ST_X(localization::geometry) as longitude,
        ST_Y(localization::geometry) as latitude
      FROM "addresses"
      WHERE id = ${idAddress}
      LIMIT 1
    `;

    if (!coordinates || coordinates.length === 0) {
      throw new NotFoundException(
        `Localization para o endereço '${idAddress}' não foi encontrado`,
      );
    }

    return coordinates[0];
  }

  async createAddress(
    prisma: PrismaService,
    body: AddressDto,
  ): Promise<{ id: number }> {
    const localization = await this.reverse(
      body.city,
      body.state,
      body.street,
      body.number,
      body.zipCode,
    );

    const [address] = await prisma.$queryRawUnsafe<{ id: number }[]>(
      `
      INSERT INTO "addresses" (city, state, street, number, "zipCode", country, complement, localization)
      VALUES ($1, $2, $3, $4, $5, $6, $7, ST_SetSRID(ST_MakePoint($8, $9), 4326))
      RETURNING id
      `,
      body.city,
      body.state,
      body.street,
      body.number,
      body.zipCode,
      'Brasil',
      '',
      localization.longitude,
      localization.latitude,
    );

    return address;
  }

  async getAddressLocalizationByUser(
    prisma: PrismaService,
    idUser: number,
    type: 'companies' | 'deliverymen',
  ): Promise<ILocalization> {
    if (type !== 'companies' && type !== 'deliverymen') {
      throw new Error('Tipo inválido');
    }

    const query = `
      SELECT
        ST_X(a.localization::geometry) as longitude,
        ST_Y(a.localization::geometry) as latitude
      FROM "addresses" a
        INNER JOIN "${type}" c ON c."idAddress" = a.id
      WHERE c."id_user" = $1
      LIMIT 1
    `;

    const coordinates = await prisma.$queryRawUnsafe<ILocalization[]>(
      query,
      idUser,
    );

    if (!coordinates || coordinates.length === 0) {
      throw new NotFoundException(
        `Localization para o endereço do usuario '${idUser}' não foi encontrado`,
      );
    }

    return coordinates[0];
  }

  async getAddressByUser(
    prisma: PrismaService,
    idUser: number,
    type: 'companies' | 'deliverymen',
  ): Promise<Address> {
    if (type !== 'companies' && type !== 'deliverymen') {
      throw new Error('Tipo inválido');
    }

    const query = `
      SELECT
        city, state, street, number, "zipCode", country, complement
      FROM "addresses" a
        INNER JOIN "${type}" c ON c."idAddress" = a.id
      WHERE c."id_user" = $1
      LIMIT 1
    `;

    const address = await prisma.$queryRawUnsafe<Address[]>(query, idUser);

    if (!address || address.length === 0) {
      throw new NotFoundException(
        `O endereço do usuario '${idUser}' não foi encontrado`,
      );
    }

    return address[0];
  }
}
