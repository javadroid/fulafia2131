/*
  # Create Students and Attendance Tables

  1. New Tables
    - `students`
      - `id` (uuid, primary key) - Unique identifier for each student
      - `full_name` (text) - Student's full name
      - `matric_number` (text, unique) - Student's matriculation number
      - `image` (text) - Base64 encoded student image
      - `session` (text) - Academic session (e.g., 2023/2024)
      - `semester` (text) - Academic semester (e.g., First Semester)
      - `registration_date` (timestamptz) - Date of registration
      - `created_at` (timestamptz) - Record creation timestamp

    - `student_courses`
      - `id` (uuid, primary key) - Unique identifier
      - `student_id` (uuid, foreign key) - Reference to students table
      - `course_code` (text) - Course code and name
      - `created_at` (timestamptz) - Record creation timestamp

    - `attendance_records`
      - `id` (uuid, primary key) - Unique identifier
      - `matric_number` (text) - Student's matriculation number
      - `course_code` (text) - Course code and name
      - `verification_date` (timestamptz) - Date and time of verification
      - `invigilator_name` (text) - Name of the invigilator who verified
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since this is an internal university system)

  3. Indexes
    - Add indexes on matric_number for faster lookups
    - Add indexes on course_code for filtering
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  matric_number text UNIQUE NOT NULL,
  image text NOT NULL,
  session text NOT NULL DEFAULT '2024/2025',
  semester text NOT NULL DEFAULT 'First Semester',
  registration_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create student_courses table
CREATE TABLE IF NOT EXISTS student_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, course_code)
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matric_number text NOT NULL,
  course_code text NOT NULL,
  verification_date timestamptz DEFAULT now(),
  invigilator_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(matric_number, course_code)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_students_matric_number ON students(matric_number);
CREATE INDEX IF NOT EXISTS idx_students_session ON students(session);
CREATE INDEX IF NOT EXISTS idx_students_semester ON students(semester);
CREATE INDEX IF NOT EXISTS idx_student_courses_student_id ON student_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_course_code ON student_courses(course_code);
CREATE INDEX IF NOT EXISTS idx_attendance_matric_number ON attendance_records(matric_number);
CREATE INDEX IF NOT EXISTS idx_attendance_course_code ON attendance_records(course_code);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (internal university system)
CREATE POLICY "Allow public read access to students"
  ON students FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to students"
  ON students FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to students"
  ON students FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to student_courses"
  ON student_courses FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to student_courses"
  ON student_courses FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delete to student_courses"
  ON student_courses FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to attendance_records"
  ON attendance_records FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to attendance_records"
  ON attendance_records FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to attendance_records"
  ON attendance_records FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);