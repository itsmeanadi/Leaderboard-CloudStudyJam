import { connectToDatabase, initializeDatabase } from './db';

export async function initializeApp() {
  try {
    console.log('Initializing application database...');
    await connectToDatabase();
    await initializeDatabase();
    console.log('Application database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize application database:', error);
    throw error;
  }
}