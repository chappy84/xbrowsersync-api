"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_service_1 = require("./base.service");
const Config = require("../config");
const exception_1 = require("../exception");
const Server = require("../server");
const bookmarks_model_1 = require("../models/bookmarks.model");
// Implementation of data service for bookmarks operations
class BookmarksService extends base_service_1.default {
    // Creates a new bookmarks sync with the supplied bookmarks data
    createBookmarks_v1(bookmarksData, req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Before proceeding, check service is available
            Server.checkServiceAvailability();
            // Check service is accepting new syncs
            const isAcceptingNewSyncs = yield this.isAcceptingNewSyncs();
            if (!isAcceptingNewSyncs) {
                throw new exception_1.NewSyncsForbiddenException();
            }
            // Check if daily new syncs limit has been hit if config value enabled
            if (Config.get().dailyNewSyncsLimit > 0) {
                const newSyncsLimitHit = yield this.service.newSyncsLimitHit(req);
                if (newSyncsLimitHit) {
                    throw new exception_1.NewSyncsLimitExceededException();
                }
            }
            try {
                // Create new bookmarks payload
                const newBookmarks = {
                    bookmarks: bookmarksData
                };
                const bookmarksModel = new bookmarks_model_1.default(newBookmarks);
                // Commit the bookmarks payload to the db
                const savedBookmarks = yield bookmarksModel.save();
                // Add to logs
                if (Config.get().dailyNewSyncsLimit > 0) {
                    yield this.service.createLog(req);
                }
                this.log(Server.LogLevel.Info, 'New bookmarks sync created', req);
                // Return the response data
                const returnObj = {
                    id: savedBookmarks._id,
                    lastUpdated: savedBookmarks.lastUpdated
                };
                return returnObj;
            }
            catch (err) {
                this.log(Server.LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
                throw err;
            }
        });
    }
    // Creates an empty sync with the supplied version info
    createBookmarks_v2(syncVersion, req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Before proceeding, check service is available
            Server.checkServiceAvailability();
            // Check service is accepting new syncs
            const isAcceptingNewSyncs = yield this.isAcceptingNewSyncs();
            if (!isAcceptingNewSyncs) {
                throw new exception_1.NewSyncsForbiddenException();
            }
            // Check if daily new syncs limit has been hit if config value enabled
            if (Config.get().dailyNewSyncsLimit > 0) {
                const newSyncsLimitHit = yield this.service.newSyncsLimitHit(req);
                if (newSyncsLimitHit) {
                    throw new exception_1.NewSyncsLimitExceededException();
                }
            }
            try {
                // Create new bookmarks payload
                const newBookmarks = {
                    version: syncVersion
                };
                const bookmarksModel = new bookmarks_model_1.default(newBookmarks);
                // Commit the bookmarks payload to the db
                const savedBookmarks = yield bookmarksModel.save();
                // Add to logs
                if (Config.get().dailyNewSyncsLimit > 0) {
                    yield this.service.createLog(req);
                }
                this.log(Server.LogLevel.Info, 'New bookmarks sync created', req);
                // Return the response data
                const returnObj = {
                    id: savedBookmarks._id,
                    lastUpdated: savedBookmarks.lastUpdated,
                    version: savedBookmarks.version
                };
                return returnObj;
            }
            catch (err) {
                this.log(Server.LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
                throw err;
            }
        });
    }
    // Retrieves an existing bookmarks sync using the supplied sync ID
    getBookmarks(id, req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Before proceeding, check service is available
            Server.checkServiceAvailability();
            try {
                // Query the db for the existing bookmarks data and update the last accessed date
                const updatedBookmarks = yield bookmarks_model_1.default.findOneAndUpdate({ _id: id }, { lastAccessed: new Date() }, { new: true }).exec();
                if (!updatedBookmarks) {
                    throw new exception_1.InvalidSyncIdException();
                }
                // Return the existing bookmarks data if found 
                const response = {};
                if (updatedBookmarks) {
                    response.bookmarks = updatedBookmarks.bookmarks;
                    response.version = updatedBookmarks.version;
                    response.lastUpdated = updatedBookmarks.lastUpdated;
                }
                return response;
            }
            catch (err) {
                if (!(err instanceof exception_1.InvalidSyncIdException)) {
                    this.log(Server.LogLevel.Error, 'Exception occurred in BookmarksService.getBookmarks', req, err);
                }
                throw err;
            }
        });
    }
    // Returns the last updated date for the supplied sync ID
    getLastUpdated(id, req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Before proceeding, check service is available
            Server.checkServiceAvailability();
            try {
                // Query the db for the existing bookmarks data and update the last accessed date
                const updatedBookmarks = yield bookmarks_model_1.default.findOneAndUpdate({ _id: id }, { lastAccessed: new Date() }, { new: true }).exec();
                if (!updatedBookmarks) {
                    throw new exception_1.InvalidSyncIdException();
                }
                // Return the last updated date if bookmarks data found 
                const response = {};
                if (updatedBookmarks) {
                    response.lastUpdated = updatedBookmarks.lastUpdated;
                }
                return response;
            }
            catch (err) {
                if (!(err instanceof exception_1.InvalidSyncIdException)) {
                    this.log(Server.LogLevel.Error, 'Exception occurred in BookmarksService.getLastUpdated', req, err);
                }
                throw err;
            }
        });
    }
    // Returns the sync version for the supplied sync ID
    getVersion(id, req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Before proceeding, check service is available
            Server.checkServiceAvailability();
            try {
                // Query the db for the existing bookmarks data and update the last accessed date
                const updatedBookmarks = yield bookmarks_model_1.default.findOneAndUpdate({ _id: id }, { lastAccessed: new Date() }, { new: true }).exec();
                if (!updatedBookmarks) {
                    throw new exception_1.InvalidSyncIdException();
                }
                // Return the last updated date if bookmarks data found 
                const response = {};
                if (updatedBookmarks) {
                    response.version = updatedBookmarks.version;
                }
                return response;
            }
            catch (err) {
                if (!(err instanceof exception_1.InvalidSyncIdException)) {
                    this.log(Server.LogLevel.Error, 'Exception occurred in BookmarksService.getVersion', req, err);
                }
                throw err;
            }
        });
    }
    // Returns true/false depending whether the service is currently accepting new syncs
    isAcceptingNewSyncs() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if allowNewSyncs config value enabled
            if (!Config.get().status.allowNewSyncs) {
                return false;
            }
            // Check if maxSyncs config value disabled
            if (Config.get().maxSyncs === 0) {
                return true;
            }
            // Check if total syncs have reached limit set in config  
            const bookmarksCount = yield this.getBookmarksCount();
            return bookmarksCount < Config.get().maxSyncs;
        });
    }
    // Updates an existing bookmarks sync corresponding to the supplied sync ID with the supplied bookmarks data
    updateBookmarks_v1(id, bookmarksData, req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Before proceeding, check service is available
            Server.checkServiceAvailability();
            try {
                // Update the bookmarks data corresponding to the sync id in the db
                const now = new Date();
                const updatedBookmarks = yield bookmarks_model_1.default.findOneAndUpdate({ _id: id }, {
                    bookmarks: bookmarksData,
                    lastAccessed: now,
                    lastUpdated: now
                }, { new: true }).exec();
                // Return the last updated date if bookmarks data found and updated
                const response = {};
                if (updatedBookmarks) {
                    response.lastUpdated = updatedBookmarks.lastUpdated;
                }
                return response;
            }
            catch (err) {
                this.log(Server.LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
                throw err;
            }
        });
    }
    // Updates an existing bookmarks sync corresponding to the supplied sync ID with the supplied bookmarks and version data
    updateBookmarks_v2(id, bookmarksData, lastUpdated, syncVersion, req) {
        return __awaiter(this, void 0, void 0, function* () {
            // Before proceeding, check service is available
            Server.checkServiceAvailability();
            // Create update payload
            const now = new Date();
            const updatePayload = {
                bookmarks: bookmarksData,
                lastAccessed: now,
                lastUpdated: now
            };
            if (syncVersion) {
                updatePayload.version = syncVersion;
            }
            try {
                // Get the existing bookmarks using the supplied id
                const existingBookmarks = yield bookmarks_model_1.default.findById(id).exec();
                if (!existingBookmarks) {
                    throw new exception_1.InvalidSyncIdException();
                }
                // Check for sync conflicts using the supplied lastUpdated value 
                if (lastUpdated && lastUpdated !== existingBookmarks.lastUpdated.toISOString()) {
                    throw new exception_1.SyncConflictException();
                }
                // Update the bookmarks data corresponding to the sync id in the db
                const updatedBookmarks = yield bookmarks_model_1.default.findOneAndUpdate({ _id: id }, updatePayload, { new: true }).exec();
                // Return the last updated date if bookmarks data found and updated
                const response = {
                    lastUpdated: updatedBookmarks.lastUpdated
                };
                return response;
            }
            catch (err) {
                if (!(err instanceof exception_1.InvalidSyncIdException)) {
                    this.log(Server.LogLevel.Error, 'Exception occurred in BookmarksService.createBookmarks', req, err);
                }
                throw err;
            }
        });
    }
    // Returns the total number of existing bookmarks syncs
    getBookmarksCount() {
        return __awaiter(this, void 0, void 0, function* () {
            let bookmarksCount = -1;
            try {
                bookmarksCount = yield bookmarks_model_1.default.estimatedDocumentCount().exec();
            }
            catch (err) {
                this.log(Server.LogLevel.Error, 'Exception occurred in BookmarksService.getBookmarksCount', null, err);
                throw err;
            }
            // Ensure a valid count was returned
            if (bookmarksCount < 0) {
                const err = new exception_1.UnspecifiedException('Bookmarks count cannot be less than zero');
                this.log(Server.LogLevel.Error, 'Exception occurred in NewSyncLogsService.newSyncsLimitHit', null, err);
                throw err;
            }
            return bookmarksCount;
        });
    }
}
exports.default = BookmarksService;
//# sourceMappingURL=bookmarks.service.js.map