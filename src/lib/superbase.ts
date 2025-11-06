import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DatabaseStudent {
  id: string;
  full_name: string;
  matric_number: string;
  image: string;
  session: string;
  semester: string;
  registration_date: string;
  created_at: string;
}

export interface DatabaseStudentCourse {
  id: string;
  student_id: string;
  course_code: string;
  created_at: string;
}

export interface DatabaseAttendanceRecord {
  id: string;
  matric_number: string;
  course_code: string;
  verification_date: string;
  invigilator_name: string;
  created_at: string;
}
