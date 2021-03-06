import 'jest';
import { Request } from 'express';
import * as Config from '../config';
import BookmarksService from './bookmarks.service';
import InfoService from './info.service';
import { ServiceStatus } from '../server';

describe('InfoService', () => {
  let bookmarksService: BookmarksService;
  let infoService: InfoService;
  let testConfig: any;

  beforeEach(() => {
    testConfig = Config.get(true);
    const log = () => null;
    bookmarksService = new BookmarksService(null, log);
    infoService = new InfoService(bookmarksService as BookmarksService, log);
    jest.spyOn(bookmarksService, 'isAcceptingNewSyncs').mockResolvedValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('getInfo: should return location config value', async () => {
    const req: Partial<Request> = {};
    const location = 'gb';
    testConfig.location = location;
    jest.spyOn(Config, 'get').mockImplementation(() => { return testConfig; });
    const response = await infoService.getInfo(req as Request);
    expect(response.location).toStrictEqual(location.toUpperCase());
  });

  it('getInfo: should return max sync size config value', async () => {
    const req: Partial<Request> = {};
    const maxSyncSizeTestVal = 1;
    testConfig.maxSyncSize = maxSyncSizeTestVal;
    jest.spyOn(Config, 'get').mockImplementation(() => { return testConfig; });
    const response = await infoService.getInfo(req as Request);
    expect(response.maxSyncSize).toStrictEqual(maxSyncSizeTestVal);
  });

  it('getInfo: should return message config value', async () => {
    const req: Partial<Request> = {};
    const messageTestVal = 'Test API message';
    testConfig.status.message = messageTestVal;
    jest.spyOn(Config, 'get').mockImplementation(() => { return testConfig; });
    const response = await infoService.getInfo(req as Request);
    expect(response.message).toStrictEqual(messageTestVal);
  });

  it('getInfo: should strip script tags from message config value', async () => {
    const req: Partial<Request> = {};
    const messageTestVal = `<script>alert('test');</script>`;
    testConfig.status.message = messageTestVal;
    jest.spyOn(Config, 'get').mockImplementation(() => { return testConfig; });
    const response = await infoService.getInfo(req as Request);
    expect(response.message).toStrictEqual('');
  });

  it('getInfo: should return correct API status when online', async () => {
    const req: Partial<Request> = {};
    testConfig.status.online = true;
    jest.spyOn(Config, 'get').mockImplementation(() => { return testConfig; });
    const response = await infoService.getInfo(req as Request);
    expect(response.status).toStrictEqual(ServiceStatus.online);
  });

  it('getInfo: should return correct API status when offline', async () => {
    const req: Partial<Request> = {};
    testConfig.status.online = false;
    jest.spyOn(Config, 'get').mockImplementation(() => { return testConfig; });
    const response = await infoService.getInfo(req as Request);
    expect(response.status).toStrictEqual(ServiceStatus.offline);
  });

  it('getInfo: should return version config value', async () => {
    const req: Partial<Request> = {};
    const versionTestVal = '0.0.0';
    testConfig.version = versionTestVal;
    jest.spyOn(Config, 'get').mockImplementation(() => { return testConfig; });
    const response = await infoService.getInfo(req as Request);
    expect(response.version).toStrictEqual(versionTestVal);
  });
});