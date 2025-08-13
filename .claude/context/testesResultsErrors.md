⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Suites 3 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

FAIL tests/auth-optimized.test.ts > 🔐 Auth API - Versão Otimizada
TypeError: Cannot read properties of undefined (reading 'user')
❯ Function.setupBaseData tests/fixtures/database-manager.ts:58:43
56| try {
57| // Criar usuários base
58| const adminUser = await this.prisma.user.create({
| ^
59| data: {
60| email: FIXTURE_USERS.admin.email,
❯ Function.getTestContext tests/fixtures/test-helpers.ts:41:47
❯ tests/auth-optimized.test.ts:17:33

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/42]⎯

FAIL tests/auth-optimized.test.ts > 🔐 Auth API - Versão Otimizada  
Error: Database not initialized. Call initialize() first.
❯ Function.getPrisma tests/fixtures/database-manager.ts:257:13
255| static getPrisma(): PrismaClient {
256| if (!this.prisma) {
257| throw new Error('Database not initialized. Call initialize…
| ^
258| }
259| return this.prisma
❯ Function.cleanupTemporaryUsers tests/fixtures/test-helpers.ts:367:40  
 ❯ tests/auth-optimized.test.ts:22:23

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/42]⎯

FAIL tests/cenarios-optimized.test.ts > 📝 Scenarios API - Versão ULTRA Otimizada
TypeError: Cannot read properties of undefined (reading 'user')
❯ Function.setupBaseData tests/fixtures/database-manager.ts:58:43  
 56| try {
57| // Criar usuários base
58| const adminUser = await this.prisma.user.create({
| ^
59| data: {
60| email: FIXTURE_USERS.admin.email,
❯ Function.getTestContext tests/fixtures/test-helpers.ts:41:47
❯ tests/cenarios-optimized.test.ts:18:33

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/42]⎯

FAIL tests/projects-optimized.test.ts > 📁 Projects API - Versão Otimizada
TypeError: Cannot read properties of undefined (reading 'user')
❯ Function.setupBaseData tests/fixtures/database-manager.ts:58:43  
 56| try {
57| // Criar usuários base
58| const adminUser = await this.prisma.user.create({
| ^
59| data: {
60| email: FIXTURE_USERS.admin.email,
❯ Function.getTestContext tests/fixtures/test-helpers.ts:41:47
❯ tests/projects-optimized.test.ts:19:33

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/42]⎯

FAIL tests/projects-optimized.test.ts > 📁 Projects API - Versão Otimizada
Error: Database not initialized. Call initialize() first.
❯ Function.getPrisma tests/fixtures/database-manager.ts:257:13
255| static getPrisma(): PrismaClient {
256| if (!this.prisma) {
257| throw new Error('Database not initialized. Call initialize…
| ^
258| }
259| return this.prisma
❯ Function.cleanupTemporaryUsers tests/fixtures/test-helpers.ts:367:40  
 ❯ tests/projects-optimized.test.ts:27:23

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/42]⎯

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯ Failed Tests 37 ⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯

FAIL tests/auth.test.ts > 🔐 Auth API - Fluxo Completo > 4️⃣ LOGOUT - Lo ogout de Usuário > deve fazer logout invalidando refresh token
Error: expected 200 "OK", got 401 "Unauthorized"
❯ tests/auth.test.ts:183:10
181| refreshToken: refreshToken,
182| })
183| .expect(200)
| ^
184|
185| expect(response.body.message).toBe('Logout realizado com s…
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/42]⎯

FAIL tests/cenarios.test.ts > 📝 Scenarios API - Fluxo Completo > 1️⃣ CR REATE - Criar Cenários > deve criar um novo cenário com sucesso
ReferenceError: ownerResponse is not defined
❯ tests/cenarios.test.ts:123:45
121| expect(response.body).toHaveProperty('creator')
122| console.log(`LOGGGGGGG`)
123| expect(response.body.creator.id).toBe(ownerResponse.body.u…
| ^
124|
125| scenarioId = response.body.id

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/42]⎯

FAIL tests/cenarios.test.ts > 📝 Scenarios API - Fluxo Completo > 1️⃣ CR REATE - Criar Cenários > deve criar cenário com atribuição para usuário  
Error: expected 201 "Created", got 400 "Bad Request"
❯ tests/cenarios.test.ts:150:10
148| .set('Authorization', `Bearer ${accessToken}`)
149| .send(assignedScenarioData)
150| .expect(201)
| ^
151|
152| expect(response.body.assignedTo).toBe(secondUserId)  
 ❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/42]⎯

FAIL tests/cenarios.test.ts > 📝 Scenarios API - Fluxo Completo > 1️⃣ CR REATE - Criar Cenários > deve rejeitar criação com suite inexistente  
Error: expected 403 "Forbidden", got 400 "Bad Request"
❯ tests/cenarios.test.ts:183:10
181| .set('Authorization', `Bearer ${accessToken}`)
182| .send(invalidScenarioData)
183| .expect(403)
| ^
184|
185| expect(response.body.error).toBe(
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/42]⎯

FAIL tests/cenarios.test.ts > 📝 Scenarios API - Fluxo Completo > 2️⃣ RE EAD - Buscar Cenários > deve buscar cenário específico
Error: expected 200 "OK", got 400 "Bad Request"
❯ tests/cenarios.test.ts:216:10
214| .get(`/api/cenarios/${scenarioId}`)
215| .set('Authorization', `Bearer ${accessToken}`)
216| .expect(200)
| ^
217|
218| expect(response.body.id).toBe(scenarioId)
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/42]⎯

FAIL tests/cenarios.test.ts > 📝 Scenarios API - Fluxo Completo > 2️⃣ RE EAD - Buscar Cenários > deve listar cenários da suite
AssertionError: expected 1 to be greater than or equal to 2
❯ tests/cenarios.test.ts:237:46
235| expect(response.body).toHaveProperty('total')
236| expect(response.body).toHaveProperty('suiteId', suiteId)  
 237| expect(response.body.scenarios.length).toBeGreaterThanOrEq…
| ^
238|
239| console.log(`✅ ${response.body.total} cenário(s) encontrad…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/42]⎯

FAIL tests/cenarios.test.ts > 📝 Scenarios API - Fluxo Completo > 2️⃣ RE EAD - Buscar Cenários > deve permitir acesso do membro do projeto
Error: expected 200 "OK", got 400 "Bad Request"
❯ tests/cenarios.test.ts:248:10
246| .get(`/api/cenarios/${scenarioId}`)
247| .set('Authorization', `Bearer ${secondUserToken}`)  
 248| .expect(200)
| ^
249|
250| expect(response.body.id).toBe(scenarioId)
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[12/42]⎯

FAIL tests/cenarios.test.ts > 📝 Scenarios API - Fluxo Completo > 3️⃣ UP PDATE - Atualizar Cenários > deve atualizar cenário com sucesso
Error: expected 200 "OK", got 400 "Bad Request"
❯ tests/cenarios.test.ts:282:10
280| .set('Authorization', `Bearer ${accessToken}`)
281| .send(updateData)
282| .expect(200)
| ^
283|
284| expect(response.body.name).toBe(updateData.name)
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[13/42]⎯

FAIL tests/cenarios.test.ts > 📝 Scenarios API - Fluxo Completo > 3️⃣ UP PDATE - Atualizar Cenários > deve permitir atribuir cenário para usuário  
Error: expected 200 "OK", got 400 "Bad Request"
❯ tests/cenarios.test.ts:299:10
297| .set('Authorization', `Bearer ${accessToken}`)
298| .send({ assignedTo: secondUserId })
299| .expect(200)
| ^
300|
301| expect(response.body.assignedTo).toBe(secondUserId)  
 ❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[14/42]⎯

FAIL tests/cenarios.test.ts > 📝 Scenarios API - Fluxo Completo > 3️⃣ UP PDATE - Atualizar Cenários > deve rejeitar usuário inexistente na atribuição
Error: expected 404 "Not Found", got 400 "Bad Request"
❯ tests/cenarios.test.ts:314:10
312| .set('Authorization', `Bearer ${accessToken}`)
313| .send({ assignedTo: 99999 })
314| .expect(404)
| ^
315|
316| expect(response.body.error).toBe('Usuário atribuído não en…
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[15/42]⎯

FAIL tests/cenarios.test.ts > 📝 Scenarios API - Fluxo Completo > 4️⃣ ST TATS - Estatísticas do Cenário > deve obter estatísticas do cenário  
Error: expected 200 "OK", got 400 "Bad Request"
❯ tests/cenarios.test.ts:328:10
326| .get(`/api/cenarios/${scenarioId}/stats`)
327| .set('Authorization', `Bearer ${accessToken}`)
328| .expect(200)
| ^
329|
330| expect(response.body).toHaveProperty('totalExecutions', 0)
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[16/42]⎯

FAIL tests/cenarios.test.ts > 📝 Scenarios API - Fluxo Completo > 5️⃣ DU UPLICATE - Duplicar Cenário > deve duplicar cenário com sucesso
Error: expected 201 "Created", got 400 "Bad Request"
❯ tests/cenarios.test.ts:350:10
348| .post(`/api/cenarios/${scenarioId}/duplicate`)
349| .set('Authorization', `Bearer ${accessToken}`)
350| .expect(201)
| ^
351|
352| expect(response.body.name).toBe('Cenário de Login Atualiza…
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[17/42]⎯

FAIL tests/cenarios.test.ts > 📝 Scenarios API - Fluxo Completo > 6️⃣ PE ERMISSIONS - Controle de Acesso > deve negar acesso a usuário não autorizado
Error: expected 403 "Forbidden", got 400 "Bad Request"
❯ tests/cenarios.test.ts:383:10
381| .get(`/api/cenarios/${scenarioId}`)
382| .set('Authorization', `Bearer ${unauthorizedResponse.bod…
383| .expect(403)
| ^
384|
385| expect(response.body.error).toBe(
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[18/42]⎯

FAIL tests/cenarios.test.ts > 📝 Scenarios API - Fluxo Completo > 6️⃣ PE ERMISSIONS - Controle de Acesso > deve negar atualização por usuário sem permissão
Error: expected 403 "Forbidden", got 400 "Bad Request"
❯ tests/cenarios.test.ts:404:10
402| .set('Authorization', `Bearer ${secondUserToken}`)  
 403| .send({ name: 'Tentativa de hack' })
404| .expect(403)
| ^
405|
406| expect(response.body.error).toBe(
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[19/42]⎯

FAIL tests/cenarios.test.ts > 📝 Scenarios API - Fluxo Completo > 7️⃣ DE ELETE - Excluir Cenários > deve excluir cenário sem execuções
TypeError: Cannot read properties of undefined (reading 'id')
❯ tests/cenarios.test.ts:428:53
426|
427| const response = await request(BASE_URL)
428| .delete(`/api/cenarios/${duplicatedScenario.id}`)  
 | ^
429| .set('Authorization', `Bearer ${accessToken}`)
430| .expect(200)

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[20/42]⎯

FAIL tests/comentarios.test.ts > 💬 Comments API - Fluxo Completo > 1️⃣ CREATE - Criar Comentários > deve criar um novo comentário com sucesso  
ReferenceError: ownerResponse is not defined
❯ tests/comentarios.test.ts:139:42
137| expect(response.body).toHaveProperty('executionId', execut…
138| expect(response.body).toHaveProperty('user')
139| expect(response.body.user.id).toBe(ownerResponse.body.user…
| ^
140| expect(response.body).toHaveProperty('createdAt')
141| expect(response.body).toHaveProperty('execution')

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[21/42]⎯

FAIL tests/comentarios.test.ts > 💬 Comments API - Fluxo Completo > 2️⃣ READ - Buscar Comentários > deve buscar comentário específico
Error: expected 200 "OK", got 400 "Bad Request"
❯ tests/comentarios.test.ts:220:10
218| .get(`/api/comentarios/${commentId}`)
219| .set('Authorization', `Bearer ${accessToken}`)
220| .expect(200)
| ^
221|
222| expect(response.body.id).toBe(commentId)
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[22/42]⎯

FAIL tests/comentarios.test.ts > 💬 Comments API - Fluxo Completo > 2️⃣ READ - Buscar Comentários > deve listar comentários da execução
AssertionError: expected 5 to be undefined // Object.is equality

- Expected:
  undefined

* Received:
  5

❯ tests/comentarios.test.ts:244:44
242|
243| // Verificar ordenação cronológica (mais antigo primeiro)  
 244| expect(response.body.comments[0].id).toBe(commentId)  
 | ^
245| expect(response.body.comments[1].user.id).toBe(secondUserI…
246|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[23/42]⎯

FAIL tests/comentarios.test.ts > 💬 Comments API - Fluxo Completo > 2️⃣ READ - Buscar Comentários > deve permitir acesso de outros membros do projeto
Error: expected 200 "OK", got 400 "Bad Request"
❯ tests/comentarios.test.ts:300:10
298| .get(`/api/comentarios/${commentId}`)
299| .set('Authorization', `Bearer ${secondUserToken}`)  
 300| .expect(200)
| ^
301|
302| expect(response.body.id).toBe(commentId)
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[24/42]⎯

FAIL tests/comentarios.test.ts > 💬 Comments API - Fluxo Completo > 3️⃣ UPDATE - Atualizar Comentários > deve atualizar comentário próprio dentro do prazo
Error: expected 200 "OK", got 400 "Bad Request"
❯ tests/comentarios.test.ts:331:10
329| .set('Authorization', `Bearer ${accessToken}`)
330| .send(updateData)
331| .expect(200)
| ^
332|
333| expect(response.body.comment).toBe(updateData.comment)  
 ❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[25/42]⎯

FAIL tests/comentarios.test.ts > 💬 Comments API - Fluxo Completo > 3️⃣ UPDATE - Atualizar Comentários > deve rejeitar atualização de comentário de outro usuário
Error: expected 403 "Forbidden", got 400 "Bad Request"
❯ tests/comentarios.test.ts:346:10
344| .set('Authorization', `Bearer ${secondUserToken}`)  
 345| .send({ comment: 'Tentativa de editar comentário de outr…
346| .expect(403)
| ^
347|
348| expect(response.body.error).toBe('Você só pode editar seus…
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[26/42]⎯

FAIL tests/comentarios.test.ts > 💬 Comments API - Fluxo Completo > 3️⃣ UPDATE - Atualizar Comentários > deve validar dados de atualização  
AssertionError: expected 'ID do comentário inválido' to be 'Dados inválidos' // Object.is equality

Expected: "Dados inválidos"
Received: "ID do comentário inválido"

❯ tests/comentarios.test.ts:361:35
359| .expect(400)
360|
361| expect(response.body.error).toBe('Dados inválidos')  
 | ^
362| console.log('✅ Validação na atualização funcionando')  
 363| })

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[27/42]⎯

FAIL tests/comentarios.test.ts > 💬 Comments API - Fluxo Completo > 5️⃣ PERMISSIONS - Controle de Acesso > deve negar acesso a usuário não autorizado
Error: expected 403 "Forbidden", got 400 "Bad Request"
❯ tests/comentarios.test.ts:432:10
430| .get(`/api/comentarios/${commentId}`)
431| .set('Authorization', `Bearer ${unauthorizedResponse.bod…
432| .expect(403)
| ^
433|
434| expect(response.body.error).toBe('Você não tem permissão p…
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[28/42]⎯

FAIL tests/comentarios.test.ts > 💬 Comments API - Fluxo Completo > 6️⃣ DELETE - Excluir Comentários > deve rejeitar exclusão de comentário de outro usuário
Error: expected 403 "Forbidden", got 400 "Bad Request"
❯ tests/comentarios.test.ts:507:10
505| .set('Authorization', `Bearer ${secondUserToken}`)  
 506| .send()
507| .expect(403)
| ^
508|
509| expect(response.body.error).toBe('Você só pode excluir seu…
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[29/42]⎯

FAIL tests/comentarios.test.ts > 💬 Comments API - Fluxo Completo > 7️⃣ TIME RESTRICTIONS - Restrições de Tempo > deve simular restrições de tempo (informativo)
Error: expected 200 "OK", got 400 "Bad Request"
❯ tests/comentarios.test.ts:529:10
527| .get(`/api/comentarios/${commentId}`)
528| .set('Authorization', `Bearer ${accessToken}`)
529| .expect(200)
| ^
530|
531| expect(response.body.createdAt).toBeDefined()
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[30/42]⎯

FAIL tests/execucoes.test.ts > ▶️ Executions API - Fluxo Completo > 1️⃣ START - Iniciar Execução > deve iniciar uma nova execução com sucesso  
ReferenceError: ownerResponse is not defined
❯ tests/execucoes.test.ts:128:46
126| expect(response.body).toHaveProperty('startedAt')
127| expect(response.body).toHaveProperty('executor')
128| expect(response.body.executor.id).toBe(ownerResponse.body.…
| ^
129|
130| executionId = response.body.id

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[31/42]⎯

FAIL tests/execucoes.test.ts > ▶️ Executions API - Fluxo Completo > 2️⃣ READ - Buscar Execuções > deve buscar execução específica
Error: expected 200 "OK", got 400 "Bad Request"
❯ tests/execucoes.test.ts:199:10
197| .get(`/api/execucoes/${executionId}`)
198| .set('Authorization', `Bearer ${accessToken}`)
199| .expect(200)
| ^
200|
201| expect(response.body.id).toBe(executionId)
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[32/42]⎯

FAIL tests/execucoes.test.ts > ▶️ Executions API - Fluxo Completo > 3️⃣ UPDATE - Atualizar Execuções > deve finalizar execução com sucesso (passed)
Error: expected 200 "OK", got 400 "Bad Request"
❯ tests/execucoes.test.ts:269:10
267| .set('Authorization', `Bearer ${accessToken}`)
268| .send(updateData)
269| .expect(200)
| ^
270|
271| expect(response.body.status).toBe('passed')
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[33/42]⎯

FAIL tests/execucoes.test.ts > ▶️ Executions API - Fluxo Completo > 3️⃣ UPDATE - Atualizar Execuções > deve atualizar status do cenário para completed (tem execução passed)
AssertionError: expected 'blocked' to be 'completed' // Object.is equality

Expected: "completed"
Received: "blocked"

❯ tests/execucoes.test.ts:318:36
316| .expect(200)
317|
318| expect(response.body.status).toBe('completed')
| ^
319| console.log('✅ Status do cenário atualizado para completed…
320| })

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[34/42]⎯

FAIL tests/execucoes.test.ts > ▶️ Executions API - Fluxo Completo > 3️⃣ UPDATE - Atualizar Execuções > deve rejeitar atualização sem permissão  
Error: expected 403 "Forbidden", got 400 "Bad Request"
❯ tests/execucoes.test.ts:341:10
339| .set('Authorization', `Bearer ${unauthorizedResponse.bod…
340| .send({ status: 'blocked' })
341| .expect(403)
| ^
342|
343| expect(response.body.error).toBe('Você não tem permissão p…
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[35/42]⎯

FAIL tests/execucoes.test.ts > ▶️ Executions API - Fluxo Completo > 4️⃣ RETRY - Reexecutar Cenários > deve criar nova execução baseada em execução anterior
Error: expected 201 "Created", got 400 "Bad Request"
❯ tests/execucoes.test.ts:355:10
353| .post(`/api/execucoes/${executionId}/retry`)
354| .set('Authorization', `Bearer ${accessToken}`)
355| .expect(201)
| ^
356|
357| expect(response.body.scenarioId).toBe(scenarioId)
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[36/42]⎯

FAIL tests/execucoes.test.ts > ▶️ Executions API - Fluxo Completo > 4️⃣ RETRY - Reexecutar Cenários > deve permitir múltiplas reexecuções
Error: expected 201 "Created", got 400 "Bad Request"
❯ tests/execucoes.test.ts:373:10
371| .post(`/api/execucoes/${executionId}/retry`)
372| .set('Authorization', `Bearer ${secondUserToken}`)  
 373| .expect(201)
| ^
374|
375| // Segunda reexecução
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[37/42]⎯

FAIL tests/execucoes.test.ts > ▶️ Executions API - Fluxo Completo > 5️⃣ PERMISSIONS - Controle de Acesso > deve permitir acesso a membros do projeto
Error: expected 200 "OK", got 400 "Bad Request"
❯ tests/execucoes.test.ts:394:10
392| .get(`/api/execucoes/${executionId}`)
393| .set('Authorization', `Bearer ${secondUserToken}`)  
 394| .expect(200)
| ^
395|
396| expect(response.body.id).toBe(executionId)
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[38/42]⎯

FAIL tests/execucoes.test.ts > ▶️ Executions API - Fluxo Completo > 5️⃣ PERMISSIONS - Controle de Acesso > deve negar acesso a não membros  
Error: expected 403 "Forbidden", got 400 "Bad Request"
❯ tests/execucoes.test.ts:418:10
416| .get(`/api/execucoes/${executionId}`)
417| .set('Authorization', `Bearer ${nonMemberResponse.body.a…
418| .expect(403)
| ^
419|
420| expect(response.body.error).toBe('Você não tem permissão p…
❯ Test.\_assertStatus node_modules/supertest/lib/test.js:309:14
❯ node_modules/supertest/lib/test.js:365:13
❯ Test.\_assertFunction node_modules/supertest/lib/test.js:342:13
❯ Test.assert node_modules/supertest/lib/test.js:195:23
❯ localAssert node_modules/supertest/lib/test.js:138:14
❯ fn node_modules/supertest/lib/test.js:156:7
❯ Test.callback node_modules/superagent/src/node/index.js:904:3
❯ fn node_modules/superagent/src/node/index.js:1183:18
❯ IncomingMessage.<anonymous> node_modules/superagent/src/node/parsers/json.js:19:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[39/42]⎯

FAIL tests/execucoes.test.ts > ▶️ Executions API - Fluxo Completo > 6️⃣ DELETE - Excluir Execuções > deve rejeitar exclusão de execução finalizada
AssertionError: expected 'ID da execução inválido' to contain 'Só é possível excluir execuções com s…'

Expected: "Só é possível excluir execuções com status "pending""
Received: "ID da execução inválido"

❯ tests/execucoes.test.ts:434:35
432| .expect(400)
433|
434| expect(response.body.error).toContain('Só é possível exclu…
| ^
435| console.log('✅ Exclusão de execução finalizada bloqueada')
436| })

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[40/42]⎯

FAIL tests/execucoes.test.ts > ▶️ Executions API - Fluxo Completo > 7️⃣ STATISTICS - Estatísticas e Relatórios > deve obter estatísticas atualizadas do cenário
AssertionError: expected 3 to be greater than or equal to 5
❯ tests/execucoes.test.ts:471:45
469| .expect(200)
470|
471| expect(response.body.totalExecutions).toBeGreaterThanOrEqu…
| ^
472| expect(response.body.maxExecutionRound).toBeGreaterThanOrE…
473| expect(response.body.statusCount.passed).toBeGreaterThanOr…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[41/42]⎯

FAIL tests/fluxo-completo.test.ts > 🔧 VALIDAÇÃO TÉCNICA COMPLETA > deve confirmar todas as APIs implementadas
AssertionError: expected 22 to be 18 // Object.is equality

- Expected

* Received

- 18

* 22

❯ tests/fluxo-completo.test.ts:920:25
918| apis.forEach(api => console.log(`   ✅ ${api}`))
919|
920| expect(apis.length).toBe(18) // 18 endpoints implementados  
 | ^
921| console.log(`\n🎯 Total: ${apis.length} endpoints funcionais…
922| })

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[42/42]⎯

Test Files 8 failed | 2 passed (10)
Tests 37 failed | 123 passed | 39 skipped (199)
Start at 14:23:56
Duration 37.31s (transform 1.48s, setup 256ms, collect 3.62s, tests 203.55s, environment 5ms, prepare 3.07s)

FAIL Tests failed. Watching for file changes...
press h to show help, press q to quit
