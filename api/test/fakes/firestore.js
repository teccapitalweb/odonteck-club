// Firestore falso en memoria con el subconjunto de la API de firebase-admin que usa el backend:
// collection/doc/get/set(merge)/create/update/delete, where/orderBy/limit, subcolecciones,
// runTransaction (lecturas antes que escrituras, igual que Firestore) y batch.
// Rechaza `undefined` como Firestore real para que los tests detecten ese error.

let contadorIds = 0;
const clonar = (v) => (v === undefined ? undefined : structuredClone(v));

function verificarSinUndefined(valor, ruta = '') {
  if (valor === undefined) {
    throw new Error(`Cannot use "undefined" as a Firestore value (found in field "${ruta}").`);
  }
  if (Array.isArray(valor)) valor.forEach((v, i) => verificarSinUndefined(v, `${ruta}[${i}]`));
  else if (valor && typeof valor === 'object' && !(valor instanceof Date)) {
    for (const [k, v] of Object.entries(valor)) verificarSinUndefined(v, ruta ? `${ruta}.${k}` : k);
  }
}

function leerCampo(data, campo) {
  return campo.split('.').reduce((acc, k) => (acc == null ? undefined : acc[k]), data);
}

function escribirCampo(data, campo, valor) {
  const partes = campo.split('.');
  let obj = data;
  for (const p of partes.slice(0, -1)) {
    if (obj[p] === null || typeof obj[p] !== 'object') obj[p] = {};
    obj = obj[p];
  }
  obj[partes.at(-1)] = valor;
}

function fusionar(destino, origen) {
  for (const [k, v] of Object.entries(origen)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && destino[k] && typeof destino[k] === 'object' && !Array.isArray(destino[k])) {
      fusionar(destino[k], v);
    } else {
      destino[k] = clonar(v);
    }
  }
  return destino;
}

function comparar(a, b) {
  if (a === b) return 0;
  if (a === undefined || a === null) return -1;
  if (b === undefined || b === null) return 1;
  return a < b ? -1 : 1;
}

class DocumentSnapshot {
  constructor(ref, data) {
    this.ref = ref;
    this.id = ref.id;
    this._data = data;
    this.exists = data !== undefined;
  }
  data() {
    return clonar(this._data);
  }
  get(campo) {
    return clonar(leerCampo(this._data ?? {}, campo));
  }
}

class QuerySnapshot {
  constructor(docs) {
    this.docs = docs;
    this.size = docs.length;
    this.empty = docs.length === 0;
  }
  forEach(fn) {
    this.docs.forEach(fn);
  }
}

class DocumentReference {
  constructor(db, path) {
    this._db = db;
    this.path = path;
    this.id = path.split('/').at(-1);
  }
  get parent() {
    return new CollectionReference(this._db, this.path.split('/').slice(0, -1).join('/'));
  }
  collection(nombre) {
    return new CollectionReference(this._db, `${this.path}/${nombre}`);
  }
  async get() {
    return this._db._snapshot(this);
  }
  async set(data, opciones) {
    this._db._set(this, data, opciones);
  }
  async create(data) {
    this._db._create(this, data);
  }
  async update(data) {
    this._db._update(this, data);
  }
  async delete() {
    this._db._delete(this);
  }
}

class Query {
  constructor(db, path, filtros = [], orden = [], limite = null) {
    this._db = db;
    this._path = path;
    this._filtros = filtros;
    this._orden = orden;
    this._limite = limite;
  }
  where(campo, op, valor) {
    const ops = ['==', '!=', '<', '<=', '>', '>=', 'in', 'array-contains'];
    if (!ops.includes(op)) throw new Error(`Operador no soportado en el fake: ${op}`);
    return new Query(this._db, this._path, [...this._filtros, { campo, op, valor }], this._orden, this._limite);
  }
  orderBy(campo, direccion = 'asc') {
    return new Query(this._db, this._path, this._filtros, [...this._orden, { campo, direccion }], this._limite);
  }
  limit(n) {
    return new Query(this._db, this._path, this._filtros, this._orden, n);
  }
  async get() {
    return this._db._consultar(this);
  }
}

class CollectionReference extends Query {
  constructor(db, path) {
    super(db, path);
    this.path = path;
    this.id = path.split('/').at(-1);
  }
  doc(id) {
    const docId = id ?? `auto${String(++contadorIds).padStart(6, '0')}`;
    if (typeof docId !== 'string' || docId === '' || docId.includes('/')) throw new Error(`ID de documento inválido: ${docId}`);
    return new DocumentReference(this._db, `${this.path}/${docId}`);
  }
  async add(data) {
    const ref = this.doc();
    await ref.set(data);
    return ref;
  }
}

class Transaction {
  constructor(db) {
    this._db = db;
    this._escrituras = [];
  }
  async get(refOQuery) {
    if (this._escrituras.length) throw new Error('Firestore transactions require all reads to be executed before all writes.');
    return refOQuery instanceof DocumentReference ? this._db._snapshot(refOQuery) : this._db._consultar(refOQuery);
  }
  set(ref, data, opciones) {
    verificarSinUndefined(data);
    this._escrituras.push(() => this._db._set(ref, data, opciones));
    return this;
  }
  create(ref, data) {
    verificarSinUndefined(data);
    this._escrituras.push(() => this._db._create(ref, data));
    return this;
  }
  update(ref, data) {
    verificarSinUndefined(data);
    this._escrituras.push(() => this._db._update(ref, data));
    return this;
  }
  delete(ref) {
    this._escrituras.push(() => this._db._delete(ref));
    return this;
  }
}

export class FakeFirestore {
  constructor(semilla = {}) {
    /** @type {Map<string, object>} ruta completa del documento -> datos */
    this.docs = new Map();
    this._cola = Promise.resolve();
    for (const [ruta, data] of Object.entries(semilla)) this.docs.set(ruta, clonar(data));
  }

  collection(nombre) {
    return new CollectionReference(this, nombre);
  }

  doc(ruta) {
    return new DocumentReference(this, ruta);
  }

  /** Atajo para tests: datos crudos de un documento. */
  leer(ruta) {
    return clonar(this.docs.get(ruta));
  }

  /** Atajo para tests: rutas de documentos directos de una colección. */
  rutas(coleccion) {
    return [...this.docs.keys()].filter((r) => r.split('/').slice(0, -1).join('/') === coleccion);
  }

  async runTransaction(fn) {
    // Serializa las transacciones: suficiente para comprobar que no se pisan.
    const ejecutar = async () => {
      const tx = new Transaction(this);
      const resultado = await fn(tx);
      for (const escribir of tx._escrituras) escribir();
      return resultado;
    };
    const p = this._cola.then(ejecutar, ejecutar);
    this._cola = p.catch(() => {});
    return p;
  }

  batch() {
    const escrituras = [];
    const b = {
      set: (ref, data, op) => (verificarSinUndefined(data), escrituras.push(() => this._set(ref, data, op)), b),
      update: (ref, data) => (verificarSinUndefined(data), escrituras.push(() => this._update(ref, data)), b),
      delete: (ref) => (escrituras.push(() => this._delete(ref)), b),
      commit: async () => {
        escrituras.forEach((e) => e());
      },
    };
    return b;
  }

  _snapshot(ref) {
    return new DocumentSnapshot(ref, clonar(this.docs.get(ref.path)));
  }

  _set(ref, data, opciones = {}) {
    verificarSinUndefined(data);
    if (opciones?.merge) {
      const actual = clonar(this.docs.get(ref.path)) ?? {};
      this.docs.set(ref.path, fusionar(actual, data));
    } else {
      this.docs.set(ref.path, clonar(data));
    }
  }

  _create(ref, data) {
    if (this.docs.has(ref.path)) {
      const e = new Error(`6 ALREADY_EXISTS: Document already exists: ${ref.path}`);
      e.code = 6;
      throw e;
    }
    this._set(ref, data);
  }

  _update(ref, data) {
    verificarSinUndefined(data);
    if (!this.docs.has(ref.path)) {
      const e = new Error(`5 NOT_FOUND: No document to update: ${ref.path}`);
      e.code = 5;
      throw e;
    }
    const actual = clonar(this.docs.get(ref.path));
    for (const [campo, valor] of Object.entries(data)) escribirCampo(actual, campo, clonar(valor));
    this.docs.set(ref.path, actual);
  }

  _delete(ref) {
    this.docs.delete(ref.path);
  }

  _consultar(query) {
    let docs = [...this.docs.entries()]
      .filter(([ruta]) => ruta.split('/').slice(0, -1).join('/') === query._path)
      .map(([ruta, data]) => ({ ruta, data }));

    for (const { campo, op, valor } of query._filtros) {
      docs = docs.filter(({ data }) => {
        const v = leerCampo(data, campo);
        switch (op) {
          case '==': return v === valor;
          case '!=': return v !== undefined && v !== valor;
          case '<': return v !== undefined && v < valor;
          case '<=': return v !== undefined && v <= valor;
          case '>': return v !== undefined && v > valor;
          case '>=': return v !== undefined && v >= valor;
          case 'in': return valor.includes(v);
          case 'array-contains': return Array.isArray(v) && v.includes(valor);
          default: return false;
        }
      });
    }
    for (const { campo } of query._orden) {
      // Firestore excluye los documentos que no tienen el campo por el que se ordena.
      docs = docs.filter(({ data }) => leerCampo(data, campo) !== undefined);
    }
    if (query._orden.length) {
      docs.sort((a, b) => {
        for (const { campo, direccion } of query._orden) {
          const c = comparar(leerCampo(a.data, campo), leerCampo(b.data, campo));
          if (c !== 0) return direccion === 'desc' ? -c : c;
        }
        return 0;
      });
    }
    if (query._limite !== null) docs = docs.slice(0, query._limite);
    return new QuerySnapshot(docs.map(({ ruta, data }) => new DocumentSnapshot(new DocumentReference(this, ruta), clonar(data))));
  }
}
