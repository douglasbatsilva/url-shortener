import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { UrlRepository } from './url.repository';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Url } from './url.entity';
import { UrlMetricsListener } from './listeners/url-metrics.listener';

const createdUrl: Url = {
  id: 'mock-id',
  authorId: null,
  author: null,
  originalUrl: 'http://example.com',
  shortUrl: 'abc123',
  clicks: 0,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('UrlService', () => {
  let service: UrlService;
  let repository: UrlRepository;
  let configService: ConfigService;
  let eventEmitter: EventEmitter2;
  let listener: UrlMetricsListener;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlService,
        UrlMetricsListener,
        {
          provide: UrlRepository,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UrlService>(UrlService);
    repository = module.get<UrlRepository>(UrlRepository);
    configService = module.get<ConfigService>(ConfigService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    listener = module.get<UrlMetricsListener>(UrlMetricsListener);
  });

  describe('createShortUrl', () => {
    it('should create a short URL and return it with the base URL', async () => {
      const originalUrl = 'http://example.com';
      const userId = 1;
      const shortUrl = 'abc123';
      const baseUrl = 'http://localhost:3000';

      jest.spyOn(repository, 'create').mockResolvedValue(createdUrl);
      jest.spyOn(configService, 'get').mockReturnValue(baseUrl);

      const result = await service.createShortUrl(originalUrl, userId);

      expect(repository.create).toHaveBeenCalledWith({
        originalUrl,
        shortUrl: expect.any(String),
        author: { id: userId },
      });
      expect(configService.get).toHaveBeenCalledWith('BASE_URL');
      expect(result).toBe(`${baseUrl}/${shortUrl}`);
    });
  });

  describe('find', () => {
    it('should return a URL if found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(createdUrl);

      const result = await service.find({ shortUrl: 'abc123' });

      expect(repository.findOne).toHaveBeenCalledWith({
        shortUrl: 'abc123',
        deletedAt: expect.anything(),
      });
      expect(result).toBe(createdUrl);
    });

    it('should throw an exception if URL is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.find({ shortUrl: 'abc123' })).rejects.toThrow(
        new HttpException('URL not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('findOriginalUrl', () => {
    it('should return the original URL and emit a metric event', async () => {
      const foundUrl = { shortUrl: 'abc123', originalUrl: 'http://example.com' } as Url;

      jest.spyOn(service, 'find').mockResolvedValue(foundUrl);
      jest.spyOn(eventEmitter, 'emit').mockImplementation();

      const result = await service.findOriginalUrl('abc123');

      expect(service.find).toHaveBeenCalledWith({ shortUrl: 'abc123' });
      expect(eventEmitter.emit).toHaveBeenCalledWith('url.metric', foundUrl);
      expect(result).toBe('http://example.com');
    });
  });

  describe('onUrlMetric', () => {
    it('should increment the clicks count and update the URL in the repository', async () => {
      const updatedUrl = { ...createdUrl, clicks: createdUrl.clicks + 1 };

      jest.spyOn(repository, 'update').mockResolvedValue(undefined);

      await listener.onUrlMetric(createdUrl);

      expect(createdUrl.clicks).toBe(1); 
      expect(repository.update).toHaveBeenCalledWith(
        { id: createdUrl.id },
        updatedUrl,
      );
    });
  });

  describe('list', () => {
    it('should return a list of user URLs', async () => {
      const userId = 1;
      const urls = [
        { originalUrl: 'http://example.com', shortUrl: 'abc123', clicks: 5 },
      ] as Url[];

      jest.spyOn(repository, 'find').mockResolvedValue(urls);

      const result = await service.list(userId);

      expect(repository.find).toHaveBeenCalledWith({
        authorId: userId,
        deletedAt: expect.anything(),
      });
      expect(result).toEqual([
        {
          originalUrl: 'http://example.com',
          shortUrl: 'abc123',
          clicks: 5,
        },
      ]);
    });

    it('should return an empty array if no URLs found', async () => {
      jest.spyOn(repository, 'find').mockResolvedValue([]);

      const result = await service.list(1);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update the original URL', async () => {
      const shortUrl = 'abc123';
      const userId = 1;
      const newUrl = 'http://new-url.com';

      jest.spyOn(service, 'find').mockResolvedValue(createdUrl);
      jest.spyOn(repository, 'update').mockResolvedValue({} as any);

      await service.update(shortUrl, userId, newUrl);

      expect(service.find).toHaveBeenCalledWith({ shortUrl, authorId: userId });
      expect(createdUrl.originalUrl).toBe(newUrl);
      expect(repository.update).toHaveBeenCalledWith({ id: createdUrl.id }, createdUrl);
    });
  });

  describe('delete', () => {
    it('should soft delete a URL', async () => {
      const shortUrl = 'abc123';
      const userId = 1;

      jest.spyOn(service, 'find').mockResolvedValue(createdUrl);
      jest.spyOn(repository, 'update').mockResolvedValue({} as any);

      await service.delete(shortUrl, userId);

      expect(service.find).toHaveBeenCalledWith({ shortUrl, authorId: userId });
      expect(createdUrl.deletedAt).toBeInstanceOf(Date);
      expect(repository.update).toHaveBeenCalledWith({ id: createdUrl.id }, createdUrl);
    });
  });
});
