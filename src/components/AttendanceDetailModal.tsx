import React from 'react';
import { X, User, Calendar, UserCheck, CheckCircle, AlertCircle } from 'lucide-react';
import { Student, CourseAttendance } from '../types';

interface AttendanceDetailModalProps {
  course: string;
  students: Student[];
  attendanceRecords: CourseAttendance[];
  onClose: () => void;
}

const AttendanceDetailModal: React.FC<AttendanceDetailModalProps> = ({
  course,
  students,
  attendanceRecords,
  onClose,
}) => {
  const registeredStudents = students.filter(s => s.courses.includes(course));
  const courseAttendance = attendanceRecords.filter(a => a.courseCode === course);

  const getAttendanceStatus = (matricNumber: string) => {
    return courseAttendance.find(a => a.matricNumber === matricNumber);
  };

  const attendedCount = courseAttendance.length;
  const absentCount = registeredStudents.length - attendedCount;
  const attendancePercentage = registeredStudents.length > 0
    ? Math.round((attendedCount / registeredStudents.length) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{course}</h2>
            <p className="text-teal-100">Detailed Attendance Status</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 p-6 border-b">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{registeredStudents.length}</div>
            <div className="text-sm text-blue-700">Registered</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">{attendedCount}</div>
            <div className="text-sm text-green-700">Attended</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-900">{absentCount}</div>
            <div className="text-sm text-red-700">Absent</div>
          </div>
        </div>

        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Attendance Rate</span>
            <span className={`text-lg font-bold ${attendancePercentage >= 70 ? 'text-green-600' : 'text-red-600'}`}>
              {attendancePercentage}%
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${attendancePercentage >= 70 ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${attendancePercentage}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Student List</h3>
          <div className="space-y-3">
            {registeredStudents.map(student => {
              const attendance = getAttendanceStatus(student.matricNumber);
              const isPresent = !!attendance;

              return (
                <div
                  key={student.id}
                  className={`border-2 rounded-lg p-4 ${
                    isPresent
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                        <img
                          src={student.image}
                          alt={student.fullName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{student.fullName}</h4>
                        <p className="text-sm text-gray-600 font-mono">{student.matricNumber}</p>
                        <p className="text-xs text-gray-500">
                          {student.session} - {student.semester}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {isPresent ? (
                        <div className="flex flex-col items-end">
                          <div className="flex items-center space-x-1 text-green-700 font-semibold mb-1">
                            <CheckCircle className="w-5 h-5" />
                            <span>Attended</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(attendance.verificationDate).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-700 mt-1 flex items-center space-x-1">
                            <UserCheck className="w-3 h-3" />
                            <span className="font-medium">{attendance.invigilatorName}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-red-700 font-semibold">
                          <AlertCircle className="w-5 h-5" />
                          <span>Absent</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetailModal;
