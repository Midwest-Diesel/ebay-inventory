import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { setApiBaseUrl } from '@/scripts/config/axios';
import { resetDb } from '../resetDatabase';
import { loginUser } from '@/scripts/services/userService';

beforeAll(async () => {
  setApiBaseUrl('http://localhost:8001');
});

beforeEach(async () => {
  await resetDb();
  await loginUser({ username: 'test', password: 'mwdup' });
});


describe('Dashboard Integration', async () => {
  it('sum', async () => {
    expect(1 + 1).toEqual(2);
  });
});
