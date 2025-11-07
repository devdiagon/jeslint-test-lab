const request = require('supertest');
const app = require('../src/app');

/*
  Métodos globales de Jest
  Describe: Engloba todas las pruebas unitarias (test)
  Test: 
  Expect: 
*/

describe('Users API', () => {
  // Prueba GET que devuelva una lista vacía inicialmente
  test('GET /api/users should return an empty list initially', async () => {
    const res = await request(app).get('/api/users');

    // Esperamos que devuelva una respuesta (200 OK)
    expect(res.statusCode).toBe(200);

    // Esperamos que devuelva una lista vacía
    expect(res.body).toEqual([]);
  });

  // Prueba POST que crea un usuario correctamente
  test('POST /api/users should create a new user', async () => {
    const newUser = { name: 'Frederick', email: 'fredo@gmail.com' };
    const res = await request(app).post('/api/users').send(newUser);

    // Se espera un 201 - creado
    expect(res.statusCode).toBe(201);

    // Verificación
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Frederick');
  });

  // Prueba que el endpoint rechace las peticiones incompletas
  test('POST /api/users should fail if data is incomplete', async () => {
    // Mandar un payload incompleto
    const res = await request(app).post('/api/users').send({ name: 'Frederick' });

    // Esperamos falla (400)
    expect(res.statusCode).toBe(400);

    // Esperar recibir un mensaje, propiedad 'message' y que además tenga un mensaje específico
    expect(res.body).toHaveProperty('message', 'Name and email are required');
  });

  // Prueba que un endpoint inválido sea rechazado
  test('GET /invalid should return an ', async () => {
    const res = await request(app).get('/invalid');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'Route not found');
  });

  // Cargar en memoria una lista de usuarios (TODOS válidos) y listarlos
  test('POST several users and verify GET returns all of them at /api/users route', async () => {

    // Lista de usuarios de prueba, todos con los campos "name" e "email"
    const sampleUsers = [
      { name: 'Alice', email: 'alice@mail.com' },
      { name: 'Bob', email: 'bob@mail.com' },
      { name: 'Charlie', email: 'charlie@mail.com' },
      { name: 'Claud', email: 'claud@mail.com' },
      { name: 'Jessica', email: 'jessy@mail.com' },
    ];

    // Añadir usuarios mediante la ruta POST uno por uno 
    for (const user of sampleUsers) {
      const res = await request(app).post('/api/users').send(user);
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('email');
      expect(res.body.name).toBe(user.name);
      expect(res.body.email).toBe(user.email);
    }

    // Obtener todos los usuarios, incluido los nuevos
    const getRes = await request(app).get('/api/users');

    // 1) Verificar el código de status
    expect(getRes.statusCode).toBe(200);
    
    // 2) Verificar que la cantidad agregada sea al menos igual a la que se agregó
    expect(getRes.body.length).toBeGreaterThanOrEqual(sampleUsers.length);

    // 3) Verificar que cada elemento tiene id, name, email
    for (const user of getRes.body) {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
    }

    // 4) Verificar que cada elemento haya sido agregado correctamente
    for (const expected of sampleUsers) {
      const match = getRes.body.find(u => u.name === expected.name && u.email === expected.email);
      expect(match).toBeDefined();
    }

  });

});