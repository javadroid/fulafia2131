import React, { useState } from 'react';
import { BarChart3, Users,  Download, Filter, Eye } from 'lucide-react';
import { Student, CourseAttendance } from '../types';
import AttendanceDetailModal from './AttendanceDetailModal';

interface AttendanceReportsProps {
  students: Student[];
  attendanceRecords: CourseAttendance[];
}

const AttendanceReports: React.FC<AttendanceReportsProps> = ({
  students,
  attendanceRecords
}) => {
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [detailModalCourse, setDetailModalCourse] = useState<string | null>(null);

  // Get all unique courses from registered students
  const allCourses = Array.from(
    new Set(students.flatMap(student => student.courses))
  ).sort();

  const getStudentsForCourse = (courseCode: string) => {
    return students.filter(student => student.courses.includes(courseCode));
  };

  const getAttendanceForCourse = (courseCode: string) => {
    return attendanceRecords.filter(record => record.courseCode === courseCode);
  };

  const getCourseStats = (courseCode: string) => {
    const registeredStudents = getStudentsForCourse(courseCode);
    const attendanceList = getAttendanceForCourse(courseCode);
    
    return {
      registered: registeredStudents.length,
      attended: attendanceList.length,
      percentage: registeredStudents.length > 0 
        ? Math.round((attendanceList.length / registeredStudents.length) * 100)
        : 0
    };
  };

  const getAttendanceDetails = (courseCode: string) => {
    const attendanceList = getAttendanceForCourse(courseCode);
    
    // Only return students who were actually verified (have attendance records)
    return attendanceList.map(attendance => {
      const student = students.find(s => s.matricNumber === attendance.matricNumber);
      return {
        student: student!,
        attendance,
        status: 'present'
      };
    }).filter(detail => detail.student); // Filter out any records where student wasn't found
  };

  const exportToCSV = (courseCode: string) => {
    const details = getAttendanceDetails(courseCode);
    const csvContent = [
      ['Full Name', 'Matric Number', 'Status', 'Verification Date', 'Invigilator'].join(','),
      ...details.map(detail => [
        detail.student.fullName,
        detail.student.matricNumber,
        detail.status,
        detail.attendance?.verificationDate ? new Date(detail.attendance.verificationDate).toLocaleString() : '',
        detail.attendance?.invigilatorName || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${courseCode.replace(/\s+/g, '_')}_attendance.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center justify-between mb-6 sm:flex-row gap-3  ">
          <div className="flex items-center space-x-3">
            <div className="bg-teal-100 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6 text-teal-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Attendance Reports</h2>
          </div>
          
          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 w-40 sm:w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">All Courses</option>
              {allCourses.map(course => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Course Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {(selectedCourse ? [selectedCourse] : allCourses).map(course => {
            const stats = getCourseStats(course);
            return (
              <div
                key={course}
                className="bg-gradient-to-br from-teal-50 to-blue-50 p-6 rounded-xl border border-teal-100 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setDetailModalCourse(course)}
              >
                <h3 className="font-semibold text-gray-800 mb-2">{course}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Registered:</span>
                    <span className="font-medium">{stats.registered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Attended:</span>
                    <span className="font-medium text-green-600">{stats.attended}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Attendance:</span>
                    <span className={`font-medium ${stats.percentage >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.percentage}%
                    </span>
                  </div>
                </div>
                <div className="mt-4 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${stats.percentage >= 70 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                <div className="mt-4 flex items-center justify-center space-x-2 text-teal-700 font-medium text-sm">
                  <Eye className="w-4 h-4" />
                  <span>Click to view details</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {detailModalCourse && (
        <AttendanceDetailModal
          course={detailModalCourse}
          students={students}
          attendanceRecords={attendanceRecords}
          onClose={() => setDetailModalCourse(null)}
        />
      )}

      {/* Detailed Attendance List */}
      {selectedCourse && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Verified Students: {selectedCourse}
            </h3>
            <button
              onClick={() => exportToCSV(selectedCourse)}
              className="flex items-center space-x-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Attended Student</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Matric Number</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Verification Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Verified By (Invigilator)</th>
                </tr>
              </thead>
              <tbody>
                {getAttendanceDetails(selectedCourse).map(({ student, attendance }) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                          <img
                            src={student.image}
                            alt={student.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{student.fullName}</div>
                          <div className="text-xs text-green-600 font-medium">✓ Attended Exam</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-sm text-gray-600">
                      {student.matricNumber}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(attendance.verificationDate).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{attendance.invigilatorName}</span>
                        <span className="text-xs text-blue-600 font-medium">Invigilator</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {getAttendanceDetails(selectedCourse).length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No students have attended this course exam yet.</p>
            </div>
          )}

          {/* Verification Summary */}
          {getAttendanceDetails(selectedCourse).length > 0 && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">Exam Attendance Summary:</h4>
              <div className="text-sm text-green-700">
                <p className="mb-2">
                  <strong>{getAttendanceDetails(selectedCourse).length}</strong> student(s) attended {selectedCourse} exam
                </p>
                <div className="space-y-2 mt-3">
                  <h5 className="font-medium text-green-800">Students who attended and their invigilators:</h5>
                  {getAttendanceDetails(selectedCourse).map(detail => (
                    <div key={detail.student.id} className="bg-white p-3 rounded border border-green-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-gray-900">{detail.student.fullName}</span>
                          <span className="text-gray-600 ml-2">({detail.student.matricNumber})</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-green-700">
                            <span className="font-medium">Invigilator: {detail.attendance.invigilatorName}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(detail.attendance.verificationDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overall Statistics */}
      {!selectedCourse && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Overall Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{students.length}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-2">{allCourses.length}</div>
              <div className="text-sm text-gray-600">Total Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{attendanceRecords.length}</div>
              <div className="text-sm text-gray-600">Total Verifications</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {students.reduce((total, student) => total + student.courses.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Enrollments</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReports;