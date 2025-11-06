import React, { useState } from 'react';
import { Search, UserCheck, AlertCircle, CheckCircle, User, Calendar, BookOpen } from 'lucide-react';
import { Student, CourseAttendance } from '../types';

interface StudentVerificationProps {
  students: Student[];
  attendanceRecords: CourseAttendance[];
  onMarkAttendance: (attendance: CourseAttendance) => void;
}

const StudentVerification: React.FC<StudentVerificationProps> = ({ 
  students, 
  attendanceRecords, 
  onMarkAttendance 
}) => {
  const [matricNumber, setMatricNumber] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [invigilatorName, setInvigilatorName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const handleSearch = () => {
    if (!matricNumber.trim()) {
      setMessage({ type: 'error', text: 'Please enter a matric number.' });
      return;
    }

    const student = students.find(s => 
      s.matricNumber.toLowerCase() === matricNumber.trim().toLowerCase()
    );

    if (student) {
      setSelectedStudent(student);
      setMessage(null);
    } else {
      setSelectedStudent(null);
      setMessage({ type: 'error', text: 'Student not found. Please check the matric number.' });
    }
  };

  const isAlreadyVerified = (matricNum: string, courseCode: string) => {
    return attendanceRecords.some(record => 
      record.matricNumber === matricNum && record.courseCode === courseCode
    );
  };

  const handleMarkAttendance = () => {
    if (!selectedStudent || !selectedCourse || !invigilatorName.trim()) {
      setMessage({ type: 'error', text: 'Please select a course and enter invigilator name.' });
      return;
    }

    if (isAlreadyVerified(selectedStudent.matricNumber, selectedCourse)) {
      setMessage({ 
        type: 'error', 
        text: 'Student has already been verified for this course exam.' 
      });
      return;
    }

    const attendance: CourseAttendance = {
      id: Date.now().toString(),
      matricNumber: selectedStudent.matricNumber,
      courseCode: selectedCourse,
      verificationDate: new Date().toISOString(),
      invigilatorName: invigilatorName.trim()
    };

    onMarkAttendance(attendance);
    setMessage({ 
      type: 'success', 
      text: 'Student attendance marked successfully!' 
    });

    // Reset form
    setSelectedStudent(null);
    setSelectedCourse('');
    setMatricNumber('');
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-green-100 p-2 rounded-lg">
            <UserCheck className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Student Verification</h2>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : message.type === 'error'
              ? 'bg-red-50 border border-red-200'
              : 'bg-blue-50 border border-blue-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : message.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-600" />
            )}
            <span className={
              message.type === 'success' 
                ? 'text-green-800' 
                : message.type === 'error'
                ? 'text-red-800'
                : 'text-blue-800'
            }>
              {message.text}
            </span>
          </div>
        )}

        <div className="space-y-6">
          <div className="flex space-x-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Matric Number
              </label>
              <input
                type="text"
                value={matricNumber}
                onChange={(e) => setMatricNumber(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., CSC/2020/001"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invigilator Name
            </label>
            <input
              type="text"
              value={invigilatorName}
              onChange={(e) => setInvigilatorName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>
        </div>
      </div>

      {selectedStudent && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Student Details</span>
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200">
                  <img
                    src={selectedStudent.image}
                    alt={selectedStudent.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">{selectedStudent.fullName}</h4>
                  <p className="text-gray-600">{selectedStudent.matricNumber}</p>
                  <div className="flex items-center space-x-1 text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>Registered: {new Date(selectedStudent.registrationDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>Select Course for Verification</span>
              </h5>
              <div className="space-y-2">
                {selectedStudent.courses.map((course) => {
                  const isVerified = isAlreadyVerified(selectedStudent.matricNumber, course);
                  return (
                    <button
                      key={course}
                      onClick={() => !isVerified && setSelectedCourse(course)}
                      disabled={isVerified}
                      className={`w-full p-3 text-left border-2 rounded-lg transition-colors ${
                        isVerified
                          ? 'border-red-200 bg-red-50 text-red-500 cursor-not-allowed'
                          : selectedCourse === course
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{course}</span>
                        {isVerified && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                            Already Verified
                          </span>
                        )}
                        {selectedCourse === course && !isVerified && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {selectedCourse && !isAlreadyVerified(selectedStudent.matricNumber, selectedCourse) && (
            <div className="mt-8 pt-6 border-t">
              <button
                onClick={handleMarkAttendance}
                className="w-full bg-green-600 text-white py-4 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <UserCheck className="w-5 h-5" />
                <span>Mark Attendance for {selectedCourse}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentVerification;