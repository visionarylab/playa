import PouchDB from 'pouchdb';
import PouchFind from 'pouchdb-find';
import search from 'pouchdb-quick-search';

import log, { LogContext } from './logger';
import { DatabaseError } from '../errors';

const DEFAULT_QUERY_LIMIT = 20;
const DEFAULT_QUERY_ORDER = 'asc';

PouchDB.plugin(PouchFind);
PouchDB.plugin(search);

interface Entity {
  _id: string;
  _rev: string;
  _deleted?: boolean;
}

interface Row<T> {
  doc: T;
  id: string;
  score: number;
  error?: boolean;
}

interface Result {
  ok?: boolean;
  error?: string;
  id?: string;
  rev?: string;
}

type DatabaseParams = {
  path: string;
  name: string;
  debug?: boolean;
}

export default class Database {
  private db: any;  // eslint-disable-line
  private debug: boolean;
  constructor({
    path,
    name,
    debug = false
  }: DatabaseParams) {
    const LocalPouchDB = PouchDB.defaults({
      prefix: path
    });
    this.db = new LocalPouchDB(name);
    this.debug = debug;
    if (this.debug) {
      PouchDB.replicate(
        this.db,
        `http://localhost:5984/${name}`,
        { live: true }
      );
    }
  }

  // uses pouchdb-find plugin, see: https://pouchdb.com/guides/mango-queries.html
  async find<T>(selector: { [key: string]: string|number }): Promise<Array<T>> {
    const fields = Object.keys(selector);
    await this.db.createIndex({
      index: { fields }
    });
    const { docs } = await this.db.find({ selector });
    return docs;
  }

  // uses pouchdb-quick-search plugin, see: https://github.com/pouchdb-community/pouchdb-quick-search
  async search<T>(query: string, fields: string[]): Promise<Array<T>> {
    const { rows } = await this.db.search({
      query: query,
      fields,
      include_docs: true, // eslint-disable-line
      highlighting: true
    });
    return rows.map((row: Row<T>) => row.doc);
  }

  async findAll<T>(): Promise<Array<T>> {
    const { rows } = await this.db.allDocs({
      include_docs: true, // eslint-disable-line
    });
    return rows.map((row: Row<T>) => row.doc);
  }

  async get<T>(_id: string): Promise<T> {
    let doc;
    try {
      doc = await this.db.get(_id);
    } catch (error) {
      if (error.name === 'not_found') {
        doc = {};
      } else {
        throw error;
      }
    }
    return doc;
  }

  async getLatest<T>({
    dateFrom = new Date().toISOString(),
    dateField = 'created',
    limit = DEFAULT_QUERY_LIMIT,
    order = DEFAULT_QUERY_ORDER
  }): Promise<T[]> {
    await this.db.createIndex({
      index: {
        fields: [dateField]
      }
    });
    const { docs } = await this.db.find({
      selector: {
        [dateField]: { $gt: dateFrom }
      },
      sort: [{ [dateField] : order }],
      limit
    });
    return docs;
  }

  async getList<T>(ids: Entity['_id'][]): Promise<Array<T>> {
    const { rows } = await this.db.allDocs({
      keys: ids,
      include_docs: true, // eslint-disable-line
    });
    return rows
      .filter((row: Row<T>) => !row.error && row.doc)
      .map((row: Row<T>) => row.doc);
  }

  async save<T extends Entity>(entity: T): Promise<T> {
    const { _id, _rev, ...other } = entity;
    const doc: T = await this.get(_id);
    let payload;
    if (doc._rev) {
      payload = { ...other, _id, _rev: doc._rev };
    } else {
      payload = { ...other, _id };
    }
    const response = await this.db.put(payload);
    if (response.ok === true) {
      return Promise.resolve({ ...entity, _rev: response.rev });
    }
    throw new DatabaseError(`Problems persisting entity: ${_id} - ${_rev}`);
  }

  async saveBulk<T>(entities: T[]): Promise<T[]> {
    log({
      context: LogContext.Database,
      message: 'Saving bulk'
    }, entities);
    return await this.db.bulkDocs(entities);
  }

  async delete<T extends Entity>(entity: T): Promise<Entity> {
    const doc: T = await this.get(entity._id);
    const response = await this.db.put({
      ...doc,
      _deleted: true
    });
    if (response.ok === true) {
      return Promise.resolve({ ...doc, _rev: response.rev });
    }
    throw new DatabaseError(`Problems deleting entity: ${doc._id} - ${doc._rev}`);
  }

  async deleteBulk<T>(entities: T[]): Promise<T[]> {
    log({
      context: LogContext.Database,
      message: 'Deleting bulk'
    }, entities);
    return await this.db.bulkDocs(
      entities.map(e => ({ ...e, _deleted: true }))
    );
  }

  async removeBulk<T>(entities: T[]): Promise<Result[]> {
    return Promise.all(
      entities.map(async entity => await this.db.remove(entity))
    ).then((results) => {
      log({
        context: LogContext.Database,
        message: 'Removing bulk'
      }, entities);
      return results;
    }).catch(() => {
      throw new DatabaseError('Problems bulk removing entities');
    });
  }
}
