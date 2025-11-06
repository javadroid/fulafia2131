import React, { useState, useMemo } from 'react';
import { Users, Filter, Search, BookOpen, Calendar } from 'lucide-react';
import { Student, CourseAttendance } from '../types';

interface StudentDetailsProps {
  students: Student[];
  attendanceRecords: CourseAttendance[];
}

const StudentDetails: React.FC<StudentDetailsProps> = ({ students, attendanceRecords }) => {
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const sessions = useMemo(() => {
    return Array.from(new Set(students.map(s => s.session))).sort().reverse();
  }, [students]);

  const semesters = useMemo(() => {
    return Array.from(new Set(students.map(s => s.semester))).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSession = !selectedSession || student.session === selectedSession;
      const matchesSemester = !selectedSemester || student.semester === selectedSemester;
      const matchesSearch = !searchQuery ||
        student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.matricNumber.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSession && matchesSemester && matchesSearch;
    });
  }, [students, selectedSession, selectedSemester, searchQuery]);

  const getStudentAttendance = (matricNumber: string) => {
    return attendanceRecords.filter(record => record.matricNumber === matricNumber);
  };

  const getAttendancePercentage = (student: Student) => {
    const attended = getStudentAttendance(student.matricNumber).length;
    const total = student.courses.length;
    return total > 0 ? Math.round((attended / total) * 100) : 0;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Registered Students</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Filter by Session</span>
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Sessions</option>
              {sessions.map(session => (
                <option key={session} value={session}>{session}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <Filter className="w-4 h-4" />
              <span>Filter by Semester</span>
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Semesters</option>
              {semesters.map(semester => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
              <Search className="w-4 h-4" />
              <span>Search Student</span>
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name or Matric Number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Showing <strong>{filteredStudents.length}</strong> student{filteredStudents.length !== 1 ? 's' : ''}
            {selectedSession && ` in ${selectedSession}`}
            {selectedSemester && ` (${selectedSemester})`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => {
          const attendance = getStudentAttendance(student.matricNumber);
          const attendancePercentage = getAttendancePercentage(student);

          return (
            <div key={student.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                    <img
                      src={student.image}
                      alt={student.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{student.fullName}</h3>
                    <p className="text-sm text-gray-600 font-mono">{student.matricNumber}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Session:</span>
                    <span className="font-medium text-gray-900">{student.session}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Semester:</span>
                    <span className="font-medium text-gray-900">{student.semester}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Registered:</span>
                    <span className="text-gray-700">{new Date(student.registrationDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Courses: {student.courses.length}</span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {student.courses.map((course, index) => {
                      const hasAttended = attendance.some(a => a.courseCode === course);
                      return (
                        <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                          <span className="text-gray-700 truncate flex-1">{course}</span>
                          {hasAttended && (
                            <span className="text-green-600 font-medium ml-2">Attended</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Exam Attendance</span>
                    <span className={`text-sm font-bold ${attendancePercentage >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                      {attendancePercentage}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2">
                    <span>{attendance.length} of {student.courses.length} exams attended</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${attendancePercentage >= 70 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${attendancePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No students found matching your filters.</p>
          {(selectedSession || selectedSemester || searchQuery) && (
            <button
              onClick={() => {
                setSelectedSession('');
                setSelectedSemester('');
                setSearchQuery('');
              }}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDetails;
