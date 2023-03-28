import Dexie, { Table } from "dexie";

interface IConfigs {
  name: string;
  type: string;
  accessKey: string;
  accessSecret: string;
  region: string;
  endpoint: string;
}

export class FstorageToolDB extends Dexie {
  configs!: Dexie.Table<IConfigs, number>;

  constructor () {
    super("FstorageToolDB");
    this.version(1).stores({
      configs: 'accessKey, accessSecret, name, type, region, endpoint'
    });
  }
}

export const db = new FstorageToolDB();

// export const db = new Dexie("MountToolDB");

// db.version(1).stores({
//   configs: 'name, type, accessKey, accessSecret, region, endpoint'
// });

// db.open().catch((e) => {
//   console.error("ERROR:", e);
// });

// export class MountToolDB extends Dexie {
//   configs!: Table<ConfigsTable>;

//   constructor() {
//     super('MountToolDB');
//     this.version(1).stores({
//       config: 'name, type, accessKey, accessSecret, region, endpoint'
//     });
//   }

//   deleteConfig(configId: number) {
//     return this.transaction('rw', this.configs, () => {
//       this.configs.where({ configId }).delete();
//     })
//   }
// }

// export const db = new MountToolDB();

// export function resetDatabase() {
//   return db.transaction('rw', db.configs, async () => {
//     await Promise.all(db.tables.map(table => table.clear()));
//   });
// }
