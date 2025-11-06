import React, { useState, useEffect } from 'react';
import { User, UserCheck, BookOpen, Users, Camera, CheckCircle, AlertCircle, Home, FileText } from 'lucide-react';
import StudentRegistration from './components/StudentRegistration';
import StudentVerification from './components/StudentVerification';
import AttendanceReports from './components/AttendanceReports';
import StudentDetails from './components/StudentDetails';
import { Student, CourseAttendance } from './types';
import { supabase } from './lib/supabase';

type View = 'home' | 'register' | 'verify' | 'reports' | 'details';

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<CourseAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadStudents(), loadAttendance()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('*');

    if (studentsError) {
      console.error('Error loading students:', studentsError);
      return;
    }

    if (studentsData) {
      const { data: coursesData } = await supabase
        .from('student_courses')
        .select('*');

      const studentsWithCourses: Student[] = studentsData.map(student => {
        const studentCourses = coursesData?.filter(c => c.student_id === student.id) || [];
        return {
          id: student.id,
          fullName: student.full_name,
          matricNumber: student.matric_number,
          image: student.image,
          session: student.session,
          semester: student.semester,
          courses: studentCourses.map(c => c.course_code),
          registrationDate: student.registration_date
        };
      });

      setStudents(studentsWithCourses);
    }
  };

  const loadAttendance = async () => {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*');

    if (error) {
      console.error('Error loading attendance:', error);
      return;
    }

    if (data) {
      const attendance: CourseAttendance[] = data.map(record => ({
        id: record.id,
        matricNumber: record.matric_number,
        courseCode: record.course_code,
        verificationDate: record.verification_date,
        invigilatorName: record.invigilator_name
      }));

      setAttendanceRecords(attendance);
    }
  };

  const addStudent = async (student: Student) => {
    try {
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .insert([{
          full_name: student.fullName,
          matric_number: student.matricNumber,
          image: student.image,
          session: student.session,
          semester: student.semester,
          registration_date: student.registrationDate
        }])
        .select()
        .single();

      if (studentError) {
        console.error('Error adding student:', studentError);
        return;
      }

      if (studentData) {
        const courseInserts = student.courses.map(course => ({
          student_id: studentData.id,
          course_code: course
        }));

        const { error: coursesError } = await supabase
          .from('student_courses')
          .insert(courseInserts);

        if (coursesError) {
          console.error('Error adding courses:', coursesError);
          return;
        }

        await loadStudents();
      }
    } catch (error) {
      console.error('Error in addStudent:', error);
    }
  };

  const markAttendance = async (attendance: CourseAttendance) => {
    try {
      const { error } = await supabase
        .from('attendance_records')
        .insert([{
          matric_number: attendance.matricNumber,
          course_code: attendance.courseCode,
          verification_date: attendance.verificationDate,
          invigilator_name: attendance.invigilatorName
        }]);

      if (error) {
        console.error('Error marking attendance:', error);
        return;
      }

      await loadAttendance();
    } catch (error) {
      console.error('Error in markAttendance:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'register':
        return <StudentRegistration onAddStudent={addStudent} students={students} />;
      case 'verify':
        return <StudentVerification students={students} attendanceRecords={attendanceRecords} onMarkAttendance={markAttendance} />;
      case 'reports':
        return <AttendanceReports students={students} attendanceRecords={attendanceRecords} />;
      case 'details':
        return <StudentDetails students={students} attendanceRecords={attendanceRecords} />;
      default:
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to the Exam Management System</h2>
              <p className="text-xl text-gray-600 mb-8">Choose your role to continue</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">Course Advisor</h3>
                  <p className="text-gray-600 mb-6">Register students and view exam attendance reports</p>
                  <div className="space-y-3">
                    <button
                      onClick={() => setCurrentView('register')}
                      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Register Students
                    </button>
                    <button
                      onClick={() => setCurrentView('details')}
                      className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                    >
                      View Student Details
                    </button>
                    <button
                      onClick={() => setCurrentView('reports')}
                      className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors font-medium"
                    >
                      View Attendance Reports
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="text-center">
                  <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">Invigilator</h3>
                  <p className="text-gray-600 mb-6">Verify students and mark attendance for exams</p>
                  <button
                    onClick={() => setCurrentView('verify')}
                    className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Verify Students
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-gradient-to-r from-blue-50 to-teal-50 p-6 rounded-xl">
              <div className="flex items-center justify-center space-x-8 text-center">
                <div className="flex flex-col items-center">
                  <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{students.length}</span>
                  <span className="text-sm text-gray-600">Registered Students</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-gray-800">{attendanceRecords.length}</span>
                  <span className="text-sm text-gray-600">Exam Attendances</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Federal University of Lafia</h1>
                <p className="text-sm text-gray-600">Exam Verification & Attendance System</p>
              </div>
            </div>
            
            {currentView !== 'home' && (
              <button
                onClick={() => setCurrentView('home')}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {renderView()}
      </main>
    </div>
  );
}

export default App;