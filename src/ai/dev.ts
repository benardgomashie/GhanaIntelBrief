'use server';
import { config } from 'dotenv';
config({ path: '.env' });

import '@/ai/flows/article-processing-flow.ts';
