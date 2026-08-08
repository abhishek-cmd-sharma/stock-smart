import { getAuthToken } from "./contexts/AuthContext";

const API_BASE_URL = 'http://localhost:3000/api';

export const db = {}; // Mock db object for compatibility

export function serverTimestamp() {
  return new Date();
}

// Mimics Firebase's collection()
export function collection(db: any, path: string) {
  return { path };
}

// Mimics Firebase's doc()
export function doc(db: any, path: string, id: string) {
  return { path, id };
}

// Mimics Firebase's where()
export function where(field: string, op: string, value: any) {
  return { type: 'where', field, op, value };
}

// Mimics Firebase's query()
export function query(collectionRef: any, ...filters: any[]) {
  return { ...collectionRef, filters };
}

// Mimics Firebase's getDocs()
export async function getDocs(queryRef: any) {
  const token = await getAuthToken();
  if (!token) throw new Error("Not authenticated");

  let url = `${API_BASE_URL}/db/${queryRef.path}`;
  if (queryRef.filters && queryRef.filters.length > 0) {
    url += `?filters=${encodeURIComponent(JSON.stringify(queryRef.filters))}`;
  }

  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) throw new Error(`Failed to fetch from ${queryRef.path}`);
  const data = await res.json();

  return {
    empty: data.length === 0,
    docs: data.map((d: any) => ({
      id: d.id,
      data: () => d
    }))
  };
}

// Mimics Firebase's getDoc()
export async function getDoc(docRef: any) {
  const token = await getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE_URL}/db/${docRef.path}/${docRef.id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) throw new Error(`Failed to fetch doc ${docRef.id}`);
  const data = await res.json();

  return {
    id: data.id,
    exists: () => !!data.id,
    data: () => data
  };
}

// Mimics Firebase's addDoc()
export async function addDoc(collectionRef: any, data: any) {
  const token = await getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE_URL}/db/${collectionRef.path}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error(`Failed to add doc to ${collectionRef.path}`);
  const resData = await res.json();
  return { id: resData.id };
}

// Mimics Firebase's updateDoc()
export async function updateDoc(docRef: any, data: any) {
  const token = await getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE_URL}/db/${docRef.path}/${docRef.id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error(`Failed to update doc ${docRef.id}`);
}

// Mimics Firebase's deleteDoc()
export async function deleteDoc(docRef: any) {
  const token = await getAuthToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`${API_BASE_URL}/db/${docRef.path}/${docRef.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) throw new Error(`Failed to delete doc ${docRef.id}`);
}

// Mimics Firebase's writeBatch()
export function writeBatch(db: any) {
  const operations: any[] = [];
  
  return {
    set: (docRef: any, data: any) => {
      operations.push({ type: 'set', path: docRef.path, id: docRef.id, data });
    },
    update: (docRef: any, data: any) => {
      operations.push({ type: 'update', path: docRef.path, id: docRef.id, data });
    },
    delete: (docRef: any) => {
      operations.push({ type: 'delete', path: docRef.path, id: docRef.id });
    },
    commit: async () => {
      const token = await getAuthToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${API_BASE_URL}/db/batch`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ operations })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(`Batch commit failed: ${error.error || res.statusText}`);
      }
    }
  };
}
