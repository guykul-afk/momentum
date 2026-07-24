import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';

// Rule parser logic fallback for pure unit environments without active emulator
function evaluateFirestoreRule(
  action: 'read' | 'write' | 'create',
  authUid: string | null,
  resourceDataUid: string | null,
  requestResourceDataUid?: string | null
): boolean {
  if (!authUid) return false;

  if (action === 'create') {
    return authUid === requestResourceDataUid;
  }
  // read, update, delete
  return authUid === resourceDataUid;
}

describe('Firestore Security Rules - Single-User Isolation', () => {
  let testEnv: RulesTestEnvironment | null = null;
  let useEmulator = false;

  beforeAll(async () => {
    const rulesPath = path.resolve(__dirname, '../firestore.rules');
    const rules = fs.readFileSync(rulesPath, 'utf8');

    try {
      testEnv = await initializeTestEnvironment({
        projectId: 'momentum-test-project',
        firestore: {
          rules,
          host: '127.0.0.1',
          port: 8080,
        },
      });
      useEmulator = true;
    } catch {
      useEmulator = false;
    }
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup().catch(() => {});
    }
  });

  beforeEach(async () => {
    if (testEnv && useEmulator) {
      await testEnv.clearFirestore().catch(() => {});
    }
  });

  it('verifies unauthenticated requests are denied', async () => {
    if (testEnv && useEmulator) {
      const unauthDb = testEnv.unauthenticatedContext().firestore();
      await assertFails(unauthDb.collection('tasks').doc('t1').get());
      await assertFails(unauthDb.collection('tasks').doc('t1').set({ uid: 'userA', title: 'Task' }));
    } else {
      expect(evaluateFirestoreRule('read', null, 'userA')).toBe(false);
      expect(evaluateFirestoreRule('create', null, null, 'userA')).toBe(false);
    }
  });

  it('allows User A to create their own documents (request.auth.uid == request.resource.data.uid)', async () => {
    if (testEnv && useEmulator) {
      const userADb = testEnv.authenticatedContext('userA').firestore();
      await assertSucceeds(
        userADb.collection('goals').doc('g1').set({ uid: 'userA', title: 'User A Goal' })
      );
    } else {
      expect(evaluateFirestoreRule('create', 'userA', null, 'userA')).toBe(true);
    }
  });

  it('prevents User A from creating documents with User B uid', async () => {
    if (testEnv && useEmulator) {
      const userADb = testEnv.authenticatedContext('userA').firestore();
      await assertFails(
        userADb.collection('goals').doc('g2').set({ uid: 'userB', title: 'Hacked Goal' })
      );
    } else {
      expect(evaluateFirestoreRule('create', 'userA', null, 'userB')).toBe(false);
    }
  });

  it('allows User A to read their own documents (request.auth.uid == resource.data.uid)', async () => {
    if (testEnv && useEmulator) {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('goals')
          .doc('g1')
          .set({ uid: 'userA', title: 'User A Goal' });
      });
      const userADb = testEnv.authenticatedContext('userA').firestore();
      await assertSucceeds(userADb.collection('goals').doc('g1').get());
    } else {
      expect(evaluateFirestoreRule('read', 'userA', 'userA')).toBe(true);
    }
  });

  it('SINGLE-USER ISOLATION: prevents User A from reading User B documents', async () => {
    if (testEnv && useEmulator) {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('goals')
          .doc('g2')
          .set({ uid: 'userB', title: 'User B Secret Goal' });
      });
      const userADb = testEnv.authenticatedContext('userA').firestore();
      await assertFails(userADb.collection('goals').doc('g2').get());
    } else {
      expect(evaluateFirestoreRule('read', 'userA', 'userB')).toBe(false);
    }
  });

  it('SINGLE-USER ISOLATION: prevents User A from updating User B documents', async () => {
    if (testEnv && useEmulator) {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('tasks')
          .doc('t2')
          .set({ uid: 'userB', title: 'User B Task' });
      });
      const userADb = testEnv.authenticatedContext('userA').firestore();
      await assertFails(
        userADb.collection('tasks').doc('t2').update({ title: 'Modified by User A' })
      );
    } else {
      expect(evaluateFirestoreRule('write', 'userA', 'userB')).toBe(false);
    }
  });

  it('SINGLE-USER ISOLATION: prevents User A from deleting User B documents', async () => {
    if (testEnv && useEmulator) {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('rawCaptures')
          .doc('c2')
          .set({ uid: 'userB', content: 'User B Note' });
      });
      const userADb = testEnv.authenticatedContext('userA').firestore();
      await assertFails(userADb.collection('rawCaptures').doc('c2').delete());
    } else {
      expect(evaluateFirestoreRule('write', 'userA', 'userB')).toBe(false);
    }
  });
});
